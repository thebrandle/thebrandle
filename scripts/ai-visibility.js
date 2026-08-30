'use strict';

/**
 * CLI for the AI visibility audit.
 *
 *   node scripts/ai-visibility.js example.com [more domains] [--json]
 *
 * The engine itself lives in api/_lib/ so that it deploys with the serverless
 * function - .vercelignore keeps this directory out of the build on purpose.
 */

const { audit } = require('../api/_lib/ai-visibility');

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
