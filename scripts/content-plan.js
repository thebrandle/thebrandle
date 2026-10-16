// Content plan - the blog and service-page work the "blog content plan" routine
// works through, one item per run (Tuesdays and Fridays, 09:00 Dubai).
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
    linkTo: ['/blog/website-cost-dubai/', '/#pricing', '/blog/website-total-cost-of-ownership/'],
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
      'Use TheBrandle\'s real plans as the worked example, with the exact names, prices and features from home-data.js (Build and Grow, each with Basic, Pro and Max). Do not invent anything those features do not say.',
      'Red flags: unlimited revisions with no definition, vague page counts, no mention of who owns the accounts.',
    ],
    linkTo: ['/#pricing', '/blog/how-to-build-a-startup-website/', '/blog/website-maintenance-cost/'],
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
    linkTo: ['/projects/orblead-website-design', '/blog/how-to-build-a-startup-website/', '/services/ui-ux-design/'],
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
];

module.exports = { plan };
