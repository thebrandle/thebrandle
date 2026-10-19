// Content plan - the blog, money-page and service-page work the "blog content
// plan" routine works through, one item per run (Tuesdays, Wednesdays and
// Fridays, 09:00 Dubai). Blog items fall on Tuesdays and Fridays, money pages
// on Wednesdays (one a week, added 2026-10-19).
//
// Agreed with Muteeb on 2026-10-16 from an AnswerThePublic keyword export. The
// export scheduled one post per keyword (three per topic, sixteen in sixteen
// days); that would have had posts competing for the same searches and read as
// scaled content, so each topic became ONE thorough piece, topics already
// covered by the site became expansions of the existing post, and buyer-intent
// keywords went to the service pages. "Best web design agencies for startups"
// was dropped (a studio ranking agencies reads as an ad) and folded into item 1.
//
// HOW AN ITEM IS DONE - read CLAUDE.md first, then:
//   new-post      add one entry to scripts/blog-posts-data.js (date = the day
//                 you publish, `blurb` = one line for the /blog card), then
//                 `node scripts/gen-blog.js`. The cover
//                 (assets/blog/covers/<slug>.jpg), its alt text (COVER_ALT in
//                 blog-layout-2024.js) and the listing card (assets/blog/<slug>.jpg)
//                 already exist - do not regenerate or replace them. gen-blog.js
//                 adds the post to /blog, its Blog schema and the sitemap itself.
//   expand-post   rewrite the existing entry in blog-posts-data.js in place:
//                 same slug and `date`, add `updated` = today, change `title`
//                 and `h1` only as the brief says. Then `node scripts/gen-blog.js`.
//   service-pages edit the named entries in scripts/service-pages-data.js, then
//                 `node scripts/gen-service-pages-v2.js`.
//   money-page    a NEW service page: add one entry to `pages` in
//                 scripts/service-pages-data.js, inserted just before the entry
//                 with slug 'web-design-dubai' (services first, locations last).
//                 Model it on an existing entry and fill every field it has:
//                 slug, navTitle, serviceType, title, metaDescription, hubTitle,
//                 hubTagline, eyebrow, h1, heroSub, trust (3), deliverHeading,
//                 deliverSub, features (6, title + body), why (eyebrow, heading,
//                 body, points x4), processHeading, faqs (4), ctaHeading,
//                 ctaBody. Use this item's slug, title, h1 and the other given
//                 fields exactly. Then `node scripts/gen-service-pages-v2.js`:
//                 it adds the page to the /services/ hub, llms.txt and the
//                 sitemap. Expect exactly these files to change:
//                 services/<slug>/index.html (new), services/index.html,
//                 llms.txt, the sitemap, service-pages-data.js and this file.
//                 Service-page copy has no inline links; link from the FAQs'
//                 wording only where the brief says, as plain text.
// Then set this item's status to 'done' and `published` to today, and commit.
//
// Inline links: gen-blog.js only links phrases listed in LINKS (near the end
// of the file). Service links already exist ("Framer website design service",
// "get in touch", ...). For a link to another post or to /#pricing, add a
// phrase that only your post uses, like the four at the end of LINKS, and use
// it word for word, in lower case, mid-sentence.
//
// Titles: `title` gets " | TheBrandle" appended. Check it and the meta
// description with `node scripts/seo-length.js "<title> | TheBrandle" "<description>"`
// (limits 580px / 1000px). The titles below already pass.
//
// Copy rules (the site's, not suggestions): plain hyphens, never em dashes;
// British spelling, matching the existing posts; nothing invented - no
// statistics, client names, results, testimonials or quotes that are not
// already published on thebrandle.com; prices and timelines only from
// home-data.js (pricing) and faq-data.js / service-pages-data.js (timelines);
// third-party platform facts only if they are stable and general (no plan
// prices, no feature claims you cannot verify).

const plan = [
  {
    n: 1, type: 'new-post', status: 'done', due: '2026-10-16', published: '2026-10-16',
    slug: 'how-to-build-a-startup-website',
    keywords: ['startup website design', 'build website for startup', 'first business website', 'web design agency for startups'],
  },
  {
    n: 2, type: 'new-post', status: 'todo', due: '2026-10-20',
    slug: 'small-business-branding',
    title: 'Small Business Branding: What You Actually Need',
    h1: 'Branding for a small business: what you actually need',
    tag: 'Branding',
    keywords: ['small business branding', 'brand identity small business', 'brand kit design'],
    brief: [
      'What a brand identity actually is for a small business: a logo system (primary, secondary, icon), colour, type, imagery style and voice - and why a logo alone is not a brand.',
      'What goes into a brand kit, practically: logo files in the right formats, colour values, fonts and licences, a one-page usage guide, templates the team will really use (social, documents, signage).',
      'What a small business needs at each stage, and what can wait (full guidelines books, sub-brands, motion systems).',
      'Doing it yourself, a freelancer, or a studio - when each makes sense, without repeating the existing post on choosing a branding agency (link to it instead).',
      'How branding carries into the website, so the two are designed together rather than bolted on.',
    ],
    linkTo: ['/blog/branding-agency/', '/services/brand-identity-design/'],
    related: [
      { label: 'Brand Identity Design', href: '/services/brand-identity-design/' },
      { label: 'Social Media Marketing', href: '/services/social-media-marketing/' },
      { label: 'Web Design in Dubai', href: '/services/web-design-dubai/' },
    ],
    coverAlt: 'Abstract translucent forms and swatches balanced around a small glowing mark',
  },
  {
    n: 3, type: 'new-post', status: 'todo', due: '2026-10-23',
    slug: 'fixed-price-vs-hourly-web-design',
    title: 'Fixed Price vs Hourly Web Design: Which Wins?',
    h1: 'Fixed price or hourly: how to pay for a website',
    tag: 'Pricing',
    keywords: ['fixed price web design', 'web design pricing models', 'how much does a website cost'],
    brief: [
      'The three common models: fixed price for an agreed scope, hourly or day rate (time and materials), and retainers or monthly plans - how each works.',
      'Who carries the risk in each: with fixed price the studio absorbs overruns inside the scope; with hourly the client does.',
      'What a good fixed quote must spell out: pages and deliverables, revision rounds, what counts as a change, timeline, payment milestones, what happens after launch.',
      'Where hourly genuinely fits better: open-ended discovery, ongoing improvements, work that cannot be scoped yet.',
      'Red flags in either model. Be open that TheBrandle works at a fixed price (the homepage says so) and why, without turning the post into an advert.',
      'For "how much does a website cost", link to the existing Dubai cost guide rather than repeating its price bands.',
    ],
    linkTo: ['/blog/website-cost-dubai/', '/pricing/', '/blog/website-total-cost-of-ownership/'],
    related: [
      { label: 'Web Design in Dubai', href: '/services/web-design-dubai/' },
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'All Services', href: '/services/' },
    ],
    coverAlt: 'A closed abstract glass block beside an open stream of light',
  },
  {
    n: 4, type: 'new-post', status: 'todo', due: '2026-10-27',
    slug: 'how-to-choose-a-web-design-package',
    title: 'Web Design Packages: How to Pick the Right One',
    h1: 'How to choose a web design package',
    tag: 'Pricing',
    keywords: ['web design packages pricing', 'website design tiers', 'what web design plan do i need'],
    brief: [
      'What actually separates package tiers: number of pages, custom design versus template, CMS and blog, SEO setup, integrations, revision rounds, speed of delivery, post-launch support.',
      'Matching a tier to the stage of the business - a first site, a growing company, an established brand - and the questions to answer before choosing.',
      'Costs that sit outside most packages: hosting or platform plans, domains, font and plugin licences, copywriting, photography.',
      'Use TheBrandle\'s real plans as the worked example, with the exact names, prices and features from home-data.js (Build and Grow, each with Basic, Pro and Max), and link /pricing/ for the full comparison. Do not invent anything those features do not say.',
      'Red flags: unlimited revisions with no definition, vague page counts, no mention of who owns the accounts.',
    ],
    linkTo: ['/pricing/', '/blog/how-to-build-a-startup-website/', '/blog/website-maintenance-cost/'],
    related: [
      { label: 'Web Design in Dubai', href: '/services/web-design-dubai/' },
      { label: 'Framer Website Design', href: '/services/framer-website-design/' },
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
    ],
    coverAlt: 'Three abstract glass rings of different sizes, the middle one glowing',
  },
  {
    n: 5, type: 'new-post', status: 'todo', due: '2026-10-30',
    slug: 'saas-landing-page-design',
    title: 'SaaS Landing Page Design That Gets Sign-Ups',
    h1: 'SaaS landing page design: what makes people sign up',
    tag: 'SaaS',
    keywords: ['saas landing page design', 'saas website best practices', 'lead generation website design'],
    brief: [
      'The structure of a landing page people act on: a headline that states the outcome, a real product visual, proof, how it works, benefits before features, pricing or the next step, objections answered, one call to action.',
      'Choosing the conversion: free trial, demo, waitlist or contact - and what each asks of the visitor.',
      'Forms: ask only for what the next step needs; every extra field has a cost.',
      'Message match with ads and emails, page speed, and mobile layout as the default rather than an afterthought.',
      'Measuring it: set up conversion events from day one, change one thing at a time, and judge on enough traffic.',
      'Orblead is a SaaS website in the site\'s projects (/projects/orblead-website-design). You may link it as an example of our work, but claim nothing about its results.',
    ],
    linkTo: ['/projects/orblead-website-design', '/services/landing-page-design/', '/blog/how-to-build-a-startup-website/'],
    related: [
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
      { label: 'Framer Website Design', href: '/services/framer-website-design/' },
      { label: 'Webflow Website Design', href: '/services/webflow-website-design/' },
    ],
    coverAlt: 'An abstract beam of light passing through thin panels to one bright point',
  },
  {
    n: 6, type: 'new-post', status: 'todo', due: '2026-11-03',
    slug: 'what-makes-a-website-convert',
    title: 'High-Converting Website Design: What Works',
    h1: 'What makes a website convert',
    tag: 'Conversion',
    keywords: ['high converting website design', 'website conversion rate', 'website ux for conversions'],
    brief: [
      'What a conversion and a conversion rate are, and how to calculate it (conversions divided by visitors). Explain why benchmark rates vary so much by industry and traffic source - and do not quote any benchmark figure.',
      'The factors that move it: a clear offer, speed, trust and proof, friction (form length, steps, surprise costs), mobile UX, visible calls to action, and accessibility.',
      'How to find where a site is losing people: analytics funnels, heatmaps and session recordings, and watching five real users try one task.',
      'Quick fixes versus when a redesign is the honest answer.',
      'Link the existing Core Web Vitals guide for speed rather than repeating it.',
    ],
    linkTo: ['/blog/core-web-vitals-guide/', '/blog/real-estate-website-design/', '/services/ui-ux-design/'],
    related: [
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
      { label: 'Digital Marketing', href: '/services/digital-marketing/' },
      { label: 'Web Design in Dubai', href: '/services/web-design-dubai/' },
    ],
    coverAlt: 'Abstract particles of light drawn together into one bright channel',
  },
  {
    n: 7, type: 'expand-post', status: 'todo', due: '2026-11-06',
    slug: 'framer-vs-webflow',
    title: 'Framer vs Webflow (2026): Which Builder Fits?',
    h1: 'Framer vs Webflow: which builder fits your website?',
    keywords: ['framer vs webflow', 'webflow vs framer 2026', 'framer website builder'],
    brief: [
      'The existing post has only three short sections. Rewrite it into a thorough comparison (about 1,200 to 1,600 words), keeping its honest, studio-that-builds-on-both voice and its conclusion where still true.',
      'Cover: what each is; design freedom and animation; CMS and content structure; how easy each is for a non-technical client to edit; SEO controls; performance; localisation and multilingual sites; collaboration; how pricing works in general terms (no plan prices - they change); when to choose which.',
      'A short section on Framer as a website builder for teams that have never used it.',
      'Keep the slug and the original date; add `updated`. Keep the existing related services.',
    ],
    linkTo: ['/services/framer-website-design/', '/services/webflow-website-design/', '/blog/how-to-build-a-startup-website/'],
  },
  {
    n: 8, type: 'expand-post', status: 'todo', due: '2026-11-10',
    slug: 'shopify-vs-woocommerce',
    title: 'Shopify vs WordPress: Which Should You Use?',
    h1: 'Shopify vs WordPress (WooCommerce): which should you build your store on?',
    keywords: ['shopify vs wordpress', 'wordpress vs shopify 2026', 'shopify ecommerce setup'],
    brief: [
      'People search "Shopify vs WordPress"; on WordPress the store is WooCommerce. Say that early, then compare the two properly (about 1,200 to 1,600 words), keeping the existing advice where it still holds.',
      'Cover: running costs over time in general terms; who handles hosting, security and updates; ease of daily use; content and blogging; SEO; payments and checkout; scaling; migrating either way.',
      'Add a practical "setting up a Shopify store" section: domain, theme, products and collections, payments, shipping, taxes, essential apps, and a pre-launch checklist.',
      'Keep the slug and the original date; add `updated`.',
    ],
    linkTo: ['/services/shopify-website-design/', '/services/woocommerce-website-design/', '/blog/wix-to-shopify-migration/'],
  },
  {
    n: 9, type: 'service-pages', status: 'todo', due: '2026-11-13',
    slugs: ['ecommerce-website-design', 'shopify-website-design'],
    keywords: ['ecommerce website design', 'shopify store design', 'new brand online store'],
    brief: [
      '"ecommerce website design" is the biggest keyword in the plan (about 120 searches a month) and the people searching it want to hire someone, so it belongs on the service page, not in a blog post.',
      'In scripts/service-pages-data.js, make sure the ecommerce-website-design entry uses the exact phrase in its title, meta description, H1 or hero line, and at least one section, and add a section or FAQ for brands launching their first online store.',
      'Make sure the shopify-website-design entry covers "Shopify store design" in its copy and FAQ.',
      'Edit copy only - keep the page structure and every existing fact. Run node scripts/gen-service-pages-v2.js and check that only those two pages (plus sitemap/llms.txt if they change) differ.',
    ],
  },
  {
    n: 10, type: 'skip', status: 'skipped',
    keywords: ['affordable web design agency', 'startup website agency usa', 'web design agency for startups'],
    note: 'A "best agencies for startups" list written by an agency reads as an ad for itself. Folded into item 1 instead.',
  },

  // ---- money pages: pages people land on when they are ready to hire ------
  // Found 2026-10-19 by checking the site against the commercial keywords in
  // the AnswerThePublic export: these four did not exist. Pricing needed its
  // own layout, so it was built by hand; the routine writes the other three
  // into the existing service-page template.
  {
    n: 11, type: 'money-page', status: 'done', due: '2026-10-19', published: '2026-10-19',
    slug: 'pricing', url: '/pricing/',
    keywords: ['web design packages pricing', 'website design tiers', 'fixed price web design', 'affordable web design agency'],
    note: 'Built by gen-homepage.js from the homepage\'s own pricing, process, FAQ and contact sections; copy in home-data.js `pricingPage`.',
  },
  {
    n: 12, type: 'money-page', status: 'todo', due: '2026-10-28',
    slug: 'landing-page-design',
    title: 'Landing Page Design Services That Convert | TheBrandle',
    h1: 'Landing pages built to convert',
    navTitle: 'Landing pages', serviceType: 'Landing Page Design', hubTitle: 'Landing Page Design', eyebrow: 'Web · Landing pages',
    keywords: ['landing page design', 'saas landing page design', 'lead generation website design'],
    brief: [
      'The homepage schema already lists Landing Page Design as a service ("High-conversion landing pages for product launches, lead generation and marketing campaigns") - this page is where that promise lives.',
      'Who it is for: product launches, paid ad campaigns that need a page that matches the ad, lead generation, waitlists and events.',
      'Features to cover: one goal per page, message that matches the ad or email that sent the visitor, fast loading on mobile, forms that ask only what the next step needs, analytics and conversion tracking set up from day one (the plans include a basic analytics setup and a contact form), and sections the client can edit afterwards.',
      'Platforms: Framer for most launch pages, Webflow or WordPress when the page has to live inside an existing site - in line with the platform pages.',
      'FAQs (4): what a landing page costs (fixed quote agreed before work starts - point to the pricing page by name, no new prices), how long it takes (the timeline is agreed before kickoff; Framer sites often launch in 2 to 4 weeks per the Framer page), which platform, and whether it can sit on the existing domain.',
    ],
  },
  {
    n: 13, type: 'money-page', status: 'todo', due: '2026-11-04',
    slug: 'startup-website-design',
    title: 'Startup Website Design Agency | TheBrandle',
    h1: 'Websites for startups',
    navTitle: 'Startups', serviceType: 'Startup Website Design', hubTitle: 'Startup Websites', eyebrow: 'Web · Startups',
    keywords: ['web design agency for startups', 'startup website design', 'build website for startup'],
    brief: [
      'For founders launching a first site or replacing a placeholder: a site that makes a young company look established, with one clear next step (waitlist, demo, first order).',
      'Use the site\'s own facts: the Basic plans are described as "For startups building their first digital presence" and "For startups who need to launch fast, without cutting corners" (home-data.js); the Framer page calls Framer "perfect for startups and product launches"; custom sites take about 3 to 6 weeks; the scope and quote are fixed before work starts; the client owns the code.',
      'Features: launch-ready homepage and the few pages a startup actually needs, investor- and customer-ready messaging structure, Framer or Webflow so founders can edit it themselves, analytics from day one, room to grow (blog, more pages) when there is content for it.',
      'Do not repeat the blog post - this page sells the service. The why block can echo the post\'s main idea in one or two sentences.',
      'FAQs (4): cost (fixed price, plans start at $799 - name the pricing page), timeline, which platform for a startup, and what the founder needs to prepare (copy, images, decisions - as in the post).',
    ],
  },
  {
    n: 14, type: 'money-page', status: 'todo', due: '2026-11-11',
    slug: 'website-redesign',
    title: 'Website Redesign Services Without Losing SEO | TheBrandle',
    h1: 'Website redesigns that keep what works',
    navTitle: 'Redesign', serviceType: 'Website Redesign', hubTitle: 'Website Redesign', eyebrow: 'Web · Redesign',
    keywords: ['website redesign services', 'website redesign', 'redesign without losing seo'],
    brief: [
      'For businesses whose site no longer matches the business, converts poorly or is hard to edit - and who are worried about losing rankings.',
      'Use the existing post "How to redesign your website without losing SEO" (blog-posts-data.js) for the method - URL mapping, redirects, content parity, checking before and after launch - and describe it as how we work, without copying its wording.',
      'Platform moves are included where they make sense: the Shopify page says we migrate from WooCommerce, Wix, Squarespace and other platforms with redirects in place; faq-data.js says we can take over an existing build rather than start from zero.',
      'Features (6): an audit of what works now, keeping the URLs and content that earn traffic, a new design on the right platform, redirects and launch checks, a fixed scope and quote, and handover so the team can edit it.',
      'FAQs (4): will we lose rankings (explain the safeguards - promise nothing about results), cost (fixed quote; name the pricing page), can you redesign a site you did not build (yes, per faq-data.js), and how long (agreed before kickoff; custom sites usually 3 to 6 weeks).',
    ],
  },
];

module.exports = { plan };
