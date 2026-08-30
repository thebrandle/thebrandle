'use strict';

/**
 * AI visibility audit - can ChatGPT, Claude, Perplexity and Google AI actually
 * see this site, and is there anything for them to quote when they do?
 *
 * Deterministic. No model calls. Every finding traces to a fetched byte.
 *
 *   node scripts/ai-visibility.js example.com [--json]
 *
 * Also exported for api/visibility-check.js.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0 Safari/537.36 TheBrandle-VisibilityCheck/1.0';

// Split deliberately. Blocking an indexer removes you from the corpus behind
// unprompted recommendations; blocking a fetcher breaks live citation. They are
// different failures and a single "AI bots blocked" verdict hides that.
const INDEXERS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'meta-externalagent',
  'Applebot-Extended',
  'Amazonbot',
  'Bytespider',
];

const FETCHERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
];

const TIMEOUT_MS = 12000;

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, Accept: '*/*' },
    });
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      url: res.url,
      type: (res.headers.get('content-type') || '').toLowerCase(),
      body,
    };
  } catch (err) {
    return { ok: false, status: 0, url, type: '', body: '', error: String(err.message || err) };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Which agents does this robots.txt shut out?
 *
 * Group-aware: a record is one or more User-agent lines followed by rules, and
 * the rules apply to every agent named in that group. Matching is
 * case-insensitive per RFC 9309. `Disallow: /` blocks the site; an empty
 * Disallow means the opposite and must not be read as one.
 */
function parseRobots(txt) {
  const groups = [];
  let cur = null;
  let namingAgents = false;

  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();

    if (field === 'user-agent') {
      if (!namingAgents || !cur) {
        cur = { agents: [], disallow: [], allow: [] };
        groups.push(cur);
        namingAgents = true;
      }
      cur.agents.push(value.toLowerCase());
      continue;
    }
    if (!cur) continue;
    namingAgents = false;
    if (field === 'disallow') cur.disallow.push(value);
    else if (field === 'allow') cur.allow.push(value);
  }

  const blocks = (agent) => {
    const a = agent.toLowerCase();
    const g = groups.find((x) => x.agents.includes(a));
    if (!g) return null; // no group of its own - falls back to *
    // A bare "Disallow: /" with no re-Allow of the root.
    const denied = g.disallow.some((d) => d === '/');
    const readmitted = g.allow.some((d) => d === '/');
    return denied && !readmitted;
  };

  const star = groups.find((g) => g.agents.includes('*'));
  const starBlocks = star ? star.disallow.some((d) => d === '/') && !star.allow.some((d) => d === '/') : false;

  return { groups, blocks, starBlocks };
}

function classify(agents, robots) {
  return agents.map((name) => {
    const own = robots.blocks(name);
    const blocked = own === null ? robots.starBlocks : own;
    return { agent: name, blocked, via: own === null ? 'User-agent: *' : `User-agent: ${name}` };
  });
}

/** A 200 that is secretly the HTML catch-all is the most common false pass. */
function isRealTextFile(res) {
  if (!res.ok) return false;
  const head = res.body.slice(0, 400).toLowerCase();
  if (head.includes('<!doctype html') || head.includes('<html')) return false;
  if (res.type.includes('text/html')) return false;
  return res.body.trim().length > 0;
}

function extractJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      for (const node of [].concat(parsed['@graph'] || parsed)) {
        const t = node && node['@type'];
        if (t) out.push(...[].concat(t));
      }
    } catch {
      out.push('(unparseable)');
    }
  }
  return [...new Set(out)];
}

function tag(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

async function audit(input) {
  const domain = String(input).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) throw new Error(`Not a domain: ${input}`);
  const origin = `https://${domain}`;

  const [home, robotsRes, llms, sitemap] = await Promise.all([
    get(origin + '/'),
    get(origin + '/robots.txt'),
    get(origin + '/llms.txt'),
    get(origin + '/sitemap.xml'),
  ]);

  const findings = [];
  const robots = parseRobots(robotsRes.ok ? robotsRes.body : '');

  const indexers = classify(INDEXERS, robots);
  const fetchers = classify(FETCHERS, robots);
  const blockedIndexers = indexers.filter((x) => x.blocked);
  const blockedFetchers = fetchers.filter((x) => x.blocked);

  if (!home.ok) {
    findings.push({ id: 'unreachable', severity: 'critical', title: 'The homepage did not respond',
      detail: `${origin}/ returned ${home.status || home.error}.` });
  }

  if (blockedFetchers.length) {
    findings.push({ id: 'fetchers-blocked', severity: 'critical',
      title: `${blockedFetchers.length} live AI fetcher(s) blocked`,
      detail: `When somebody asks an assistant about you and it tries to open your site, it is refused: ${blockedFetchers.map((x) => x.agent).join(', ')}.` });
  }

  if (blockedIndexers.length) {
    findings.push({ id: 'indexers-blocked', severity: 'high',
      title: `${blockedIndexers.length} AI indexing crawler(s) blocked`,
      detail: `You are excluded from the datasets behind unprompted recommendations: ${blockedIndexers.map((x) => x.agent).join(', ')}.` });
  }

  if (!robotsRes.ok) {
    findings.push({ id: 'no-robots', severity: 'low', title: 'No robots.txt',
      detail: 'Not fatal - everything is permitted by default - but you have no way to state a preference.' });
  }

  const llmsReal = isRealTextFile(llms);
  if (!llmsReal) {
    findings.push({ id: 'no-llms', severity: 'medium', title: 'No usable llms.txt',
      detail: llms.status === 200
        ? '/llms.txt answers 200 but serves HTML, so it is your catch-all route, not a file. Assistants get a web page where they expect plain text.'
        : `/llms.txt returned ${llms.status || 'nothing'}. It is the one file that tells an assistant, in its own words, what you do and who you serve.` });
  }

  const sitemapReal = sitemap.ok && /<(urlset|sitemapindex)\b/i.test(sitemap.body);
  if (!sitemapReal) {
    findings.push({ id: 'no-sitemap', severity: 'medium', title: 'No valid sitemap.xml',
      detail: sitemap.status === 200 ? '/sitemap.xml responds but is not XML.' : `/sitemap.xml returned ${sitemap.status || 'nothing'}.` });
  }

  const html = home.body || '';
  const title = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = tag(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || tag(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = tag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const h1 = tag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const schemas = extractJsonLd(html);

  if (!title) findings.push({ id: 'no-title', severity: 'high', title: 'No <title>', detail: 'The single strongest signal of what a page is about.' });
  if (!desc) findings.push({ id: 'no-desc', severity: 'medium', title: 'No meta description', detail: 'Often quoted verbatim in AI answers.' });
  if (!h1) findings.push({ id: 'no-h1', severity: 'low', title: 'No <h1> in the served HTML', detail: 'Common on client-rendered sites; crawlers that do not run JavaScript see nothing.' });

  const wants = ['Organization', 'LocalBusiness', 'FAQPage'];
  const missing = wants.filter((w) => !schemas.some((s) => String(s).toLowerCase() === w.toLowerCase()));
  if (!schemas.length) {
    findings.push({ id: 'no-schema', severity: 'high', title: 'No structured data',
      detail: 'Nothing machine-readable states who you are, where you are, or what you answer. This is the most reliable way to be quoted correctly.' });
  } else if (missing.length) {
    findings.push({ id: 'partial-schema', severity: 'low', title: `Structured data present, missing ${missing.join(', ')}`,
      detail: `Found: ${schemas.join(', ')}.` });
  }

  const WEIGHT = { critical: 30, high: 15, medium: 8, low: 3 };
  const score = Math.max(0, 100 - findings.reduce((s, f) => s + (WEIGHT[f.severity] || 0), 0));

  return {
    domain,
    checkedAt: new Date().toISOString(),
    score,
    verdict: score >= 85 ? 'Visible' : score >= 60 ? 'Partly visible' : score >= 35 ? 'Barely visible' : 'Effectively invisible',
    crawlers: { indexers, fetchers, blockedIndexers: blockedIndexers.map((x) => x.agent), blockedFetchers: blockedFetchers.map((x) => x.agent) },
    page: { title, description: desc, canonical, h1: h1 ? h1.replace(/<[^>]+>/g, '').trim() : null, schemas },
    files: { robotsTxt: robotsRes.ok, llmsTxt: llmsReal, sitemapXml: sitemapReal },
    findings,
  };
}

module.exports = { audit, parseRobots, INDEXERS, FETCHERS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const targets = args.filter((a) => !a.startsWith('--'));
  if (!targets.length) {
    console.error('usage: node scripts/ai-visibility.js <domain> [more domains] [--json]');
    process.exit(1);
  }
  (async () => {
    const all = [];
    for (const t of targets) {
      try {
        const r = await audit(t);
        all.push(r);
        if (json) continue;
        console.log(`\n${'='.repeat(64)}\n${r.domain}  -  ${r.score}/100  ${r.verdict}\n${'='.repeat(64)}`);
        if (r.crawlers.blockedFetchers.length) console.log(`  live fetchers blocked : ${r.crawlers.blockedFetchers.join(', ')}`);
        if (r.crawlers.blockedIndexers.length) console.log(`  indexers blocked      : ${r.crawlers.blockedIndexers.join(', ')}`);
        console.log(`  llms.txt ${r.files.llmsTxt ? 'yes' : 'no'}   sitemap ${r.files.sitemapXml ? 'yes' : 'no'}   schema: ${r.page.schemas.join(', ') || 'none'}`);
        for (const f of r.findings) console.log(`  [${f.severity.padEnd(8)}] ${f.title}`);
      } catch (e) {
        console.error(`  ${t}: ${e.message}`);
      }
    }
    if (json) console.log(JSON.stringify(all, null, 2));
  })();
}
