// Blog post content - consumed by gen-blog.js
// Copy rules: plain hyphens only (never em dashes), interlink service pages,
// substantive answers (these target long-tail queries feeding /services/*).

const posts = [
  {
    slug: 'shopify-vs-woocommerce',
    title: 'Shopify vs WooCommerce: Which Should You Build Your Store On?',
    metaDescription: 'Shopify or WooCommerce in 2026? A practical comparison of cost, speed, maintenance and scaling - and how to pick the right platform for your online store.',
    h1: 'Shopify vs WooCommerce: which should you build your store on?',
    date: '2026-07-22',
    readMins: 6,
    tag: 'Ecommerce',
    sections: [
      { h: null, p: [
        'If you are about to launch an online store, this is usually the first real decision you hit. Shopify and WooCommerce power most of the world\'s ecommerce between them, and both can absolutely run a successful store. The right answer depends less on feature checklists and more on how you want to run your business day to day.',
        'We build on both platforms, so this is not a sales pitch for either. Here is how we actually advise clients to choose.',
      ]},
      { h: 'Shopify: the managed route', p: [
        'Shopify is a hosted platform. Hosting, security, checkout, payments and updates are Shopify\'s problem, not yours. You pay a monthly subscription, and in exchange the hard infrastructure of ecommerce simply works.',
        'That reliability is why we recommend Shopify to most direct-to-consumer brands. Checkout conversion is consistently strong, the admin is easy for non-technical teams, and the platform scales from your first sale to thousands of orders a day without re-platforming. The trade-off is flexibility at the edges: deep customisation runs through Shopify\'s theme and app system, and transaction economics include your plan fee plus payment processing.',
      ]},
      { h: 'WooCommerce: the ownership route', p: [
        'WooCommerce is a free plugin that turns a WordPress site into a store. Nothing is rented: you own the code, the data and the hosting. For content-heavy businesses that already live on WordPress, it keeps your blog, site and store in one system.',
        'The cost is responsibility. You (or your agency) manage hosting, backups, security patches, plugin conflicts and performance. Done well, WooCommerce is powerful and economical. Done casually, it becomes the slow, fragile store that gives the platform a bad name. If you choose WooCommerce, budget for proper setup and ongoing maintenance.',
      ]},
      { h: 'The practical decision', p: [
        'Choose Shopify if you want to focus on products and marketing while the platform handles the machinery - especially for DTC brands, product launches and teams without a developer on call. Our Shopify website design service covers custom theme design, conversion-focused product pages and a checkout tuned to sell.',
        'Choose WooCommerce if you need deep custom functionality, your business is built around WordPress content, or full ownership is non-negotiable. Our WordPress website design service includes WooCommerce builds with the same conversion care.',
        'Still torn? The honest tiebreaker is this: teams that pick Shopify almost never regret it; teams that pick WooCommerce only thrive when they commit to maintaining it.',
      ]},
    ],
    faq: [
      { q: 'Is Shopify or WooCommerce cheaper?', a: 'For small catalogues, WooCommerce can be cheaper on paper because the software is free. Once you add quality hosting, premium plugins and maintenance time, total cost usually lands close to Shopify\'s subscription. Shopify is more predictable; WooCommerce is more variable.' },
      { q: 'Which platform is better for SEO?', a: 'Both rank well when built properly. WooCommerce offers more technical control; Shopify covers the essentials cleanly out of the box. Site structure, content and page speed matter far more than the platform choice.' },
      { q: 'Can I migrate from WooCommerce to Shopify later?', a: 'Yes - products, customers and orders can be migrated, and we set up redirects so you keep your search rankings. We handle migrations in both directions.' },
    ],
    related: [
      { label: 'Shopify Website Design', href: '/services/shopify-website-design/' },
      { label: 'WordPress Website Design', href: '/services/wordpress-website-design/' },
      { label: 'Ecommerce Website Design', href: '/services/ecommerce-website-design/' },
    ],
  },
  {
    slug: 'website-cost-dubai',
    title: 'How Much Does a Website Cost in Dubai? (2026 Guide)',
    metaDescription: 'Real 2026 price ranges for websites in Dubai and the UAE - template builds, custom design, ecommerce stores - and what actually drives the cost up or down.',
    h1: 'How much does a website cost in Dubai?',
    date: '2026-07-22',
    readMins: 5,
    tag: 'Pricing',
    sections: [
      { h: null, p: [
        'Ask five agencies in Dubai for a website quote and you will get five numbers that differ by a factor of ten. That is not dishonesty - it is because "a website" can mean anything from a template with your logo to a custom-designed, conversion-engineered store. Here is how the market actually breaks down in 2026, so you can place quotes in context.',
      ]},
      { h: 'The three price bands', p: [
        'Template builds (roughly AED 2,000 - 8,000). A pre-made theme on WordPress, Wix or Squarespace with your content dropped in. Fast and affordable; the trade-off is a site that looks like other sites and rarely converts exceptionally. Right for validating a new business quickly.',
        'Custom-designed sites (roughly AED 10,000 - 40,000). Original design around your brand, built on a platform like Framer, Webflow or WordPress, with proper UX thinking, copy structure and SEO foundations. This is where most serious small businesses and startups should be - and where we do most of our work.',
        'Ecommerce and complex builds (roughly AED 20,000 - 100,000+). Online stores, booking systems, multi-language sites and custom functionality. The range is wide because scope is wide: a focused Shopify store sits at the lower end; large catalogues and custom integrations push higher.',
      ]},
      { h: 'What actually moves the price', p: [
        'Four things drive most of the variance: the number of unique page designs, ecommerce complexity (products, payments, shipping, subscriptions), content readiness (copy and photography you have vs need created), and the level of motion and interaction design. A tight scope on any of these saves real money; vagueness inflates every quote defensively.',
        'One thing that should not move the price: geography. Good agencies in Dubai price on scope, not on your postcode.',
      ]},
      { h: 'How to compare quotes fairly', p: [
        'Ask every agency the same three questions. What exactly is included (designs, revisions, SEO setup, launch support)? Who owns everything at handover? What happens after launch if something breaks? Cheap quotes usually get expensive at exactly these three points.',
        'We publish our approach openly: fixed, transparent quotes scoped before work begins - no surprises. See our services or get in touch for a real number against your actual scope.',
      ]},
    ],
    faq: [
      { q: 'How long does a website take to build in Dubai?', a: 'Template builds: 1-2 weeks. Custom-designed sites: 3-6 weeks. Ecommerce and complex builds: 4-10 weeks. Content readiness is the most common cause of delay - having copy and images ready can halve your timeline.' },
      { q: 'Are there ongoing costs after launch?', a: 'Yes: hosting and domain (modest), platform subscriptions if you use Shopify, Framer, Webflow or Wix, and optional maintenance. A good agency states all of these up front.' },
      { q: 'Is it cheaper to build the website myself?', a: 'In cash, yes. In outcomes, usually not - DIY sites tend to cost sales through weaker design and conversion. A sensible middle path is a professionally designed site on an easy platform like Wix, Squarespace or Framer that you then run yourself.' },
    ],
    related: [
      { label: 'All Services', href: '/services/' },
      { label: 'Shopify Website Design', href: '/services/shopify-website-design/' },
      { label: 'Wix Website Design', href: '/services/wix-website-design/' },
    ],
  },
  {
    slug: 'framer-vs-webflow',
    title: 'Framer vs Webflow: Which Builder Fits Your Website?',
    metaDescription: 'Framer vs Webflow in 2026 - speed, animation, CMS, scaling and pricing compared by an agency that builds on both. How to pick the right tool for your site.',
    h1: 'Framer vs Webflow: which builder fits your website?',
    date: '2026-07-22',
    readMins: 5,
    tag: 'Platforms',
    sections: [
      { h: null, p: [
        'Framer and Webflow are the two best no-code platforms for genuinely custom marketing sites, and the gap between them is smaller than either community admits. We design and build on both. The honest difference is not capability - it is what each tool makes effortless.',
      ]},
      { h: 'Framer: speed and motion', p: [
        'Framer is built like a design tool that publishes. Working in it feels like Figma; what you design is what ships, including animation. Scroll effects, transitions and micro-interactions that would take real effort elsewhere are native here, and a polished site can go live in a couple of weeks.',
        'That makes Framer our default recommendation for startups, founders and product launches - anywhere a striking site on a tight timeline matters. Its CMS handles blogs and changelogs cleanly. Where it thins out is heavy structured content: very large collections, complex filtering and deeply nested data are not its sweet spot.',
      ]},
      { h: 'Webflow: structure and control', p: [
        'Webflow thinks like a front-end developer. Its class-based styling and mature CMS give you precise control over structure, and it comfortably powers big content sites: hundreds of blog posts, multi-collection architectures, granular SEO settings at every level.',
        'The cost is pace: Webflow rewards expertise and punishes improvisation, so builds typically take longer than Framer. For marketing teams who publish constantly and need editorial workflow around structured content, that investment pays back every week after launch.',
      ]},
      { h: 'The practical decision', p: [
        'Launching fast, motion matters, content is modest: Framer. See our Framer website design service.',
        'Content-heavy site, complex collections, a team publishing weekly: Webflow. See our Webflow website design service.',
        'Neither locks you in forever - but migrations cost real money, so choosing right the first time matters. If you describe your content and timeline, we will tell you plainly which one we would build on, even before any engagement.',
      ]},
    ],
    faq: [
      { q: 'Is Framer or Webflow better for SEO?', a: 'Both produce fast, clean sites that rank well. Webflow offers finer-grained control for large structured sites; Framer covers all the essentials with less configuration. For most marketing sites the difference is negligible.' },
      { q: 'Which is cheaper, Framer or Webflow?', a: 'Platform subscriptions are comparable. Build cost is usually lower on Framer because design-to-launch is faster; Webflow builds take longer but suit heavier content needs. Total cost follows scope more than platform.' },
      { q: 'Can you migrate a site between Framer and Webflow?', a: 'Yes - we rebuild rather than "convert", preserving your content, design intent and SEO with proper redirects. It is a real project, which is why choosing correctly up front is worth an hour of honest advice.' },
    ],
    related: [
      { label: 'Framer Website Design', href: '/services/framer-website-design/' },
      { label: 'Webflow Website Design', href: '/services/webflow-website-design/' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
    ],
  },
  {
    slug: 'wix-to-shopify-migration',
    title: 'Moving from Wix to Shopify: A Practical Migration Guide',
    metaDescription: 'Outgrown Wix ecommerce? How to migrate to Shopify without losing sales or SEO - what moves across, what does not, timelines, and when migration is worth it.',
    h1: 'Moving from Wix to Shopify: a practical guide',
    date: '2026-07-22',
    readMins: 5,
    tag: 'Ecommerce',
    sections: [
      { h: null, p: [
        'Wix is a genuinely good way to start selling online. But stores that gain traction tend to hit its ceiling: checkout flexibility, app depth, multi-currency selling, and the operational tooling serious volume demands. When the ceiling starts costing you sales, Shopify is the natural next home. Here is what a migration actually involves.',
      ]},
      { h: 'What moves across cleanly', p: [
        'Products and variants, collections, customer records and order history all migrate. Your domain moves too - you keep your web address. Content pages are rebuilt rather than copied, which in practice is an upgrade: a Shopify build designed around your catalogue converts better than a port of your old layout.',
        'What does not transfer: Wix-specific apps, your theme, and any Wix Automations. Each has a Shopify equivalent, usually a stronger one, but plan for them deliberately rather than discovering gaps after launch.',
      ]},
      { h: 'Protecting your SEO', p: [
        'This is where DIY migrations go wrong. Wix and Shopify structure URLs differently, so every product, collection and page URL changes. Without 301 redirects mapping old URLs to new ones, your Google rankings evaporate overnight.',
        'A proper migration includes a full URL map and redirects, carried-over titles and meta descriptions, and re-submitted sitemaps. Done right, rankings dip briefly if at all, then typically improve - Shopify\'s speed and structure are assets.',
      ]},
      { h: 'Timeline and when it is worth it', p: [
        'A focused migration - store design, products, redirects, launch - typically runs 3-5 weeks. Sales continue on Wix until the moment of switchover, so there is no downtime window.',
        'When is it worth it? Three reliable signs: you are fighting Wix to implement things Shopify does natively; checkout or app limitations are visibly costing conversions; or you are expanding into markets, currencies or volumes Wix handles awkwardly. If two of the three sound familiar, migration pays for itself.',
        'Our Shopify website design service includes migrations from Wix and other platforms - products, customers, URLs and redirects handled end to end. And if you are better served staying on Wix for now, our Wix website design service will tell you exactly that.',
      ]},
    ],
    faq: [
      { q: 'Will I lose my Google rankings moving from Wix to Shopify?', a: 'Not if the migration includes proper 301 redirects and carried-over metadata. Expect stability or a brief dip followed by improvement. Skipping redirects is the one mistake that genuinely destroys rankings.' },
      { q: 'Can I keep my domain when moving to Shopify?', a: 'Yes. Your domain points to Shopify after switchover and your email stays wherever it is hosted today. Customers notice a better store, not a different address.' },
      { q: 'How much does a Wix to Shopify migration cost?', a: 'It scales with catalogue size and how custom the new store design is. We scope it up front and quote a fixed price - migrations are a defined project, not an open-ended one.' },
    ],
    related: [
      { label: 'Shopify Website Design', href: '/services/shopify-website-design/' },
      { label: 'Wix Website Design', href: '/services/wix-website-design/' },
      { label: 'Ecommerce Website Design', href: '/services/ecommerce-website-design/' },
    ],
  },
  /* ---- topic-gap cluster, batch 1 (competitor gap reports, Aug 2026) ---- */
  {
    slug: 'headless-cms-guide',
    title: 'Headless CMS: What It Is and When You Actually Need One | TheBrandle',
    metaDescription: 'A plain-English guide to headless CMS - what it means, what it costs, and the honest cases where a traditional CMS is still the better call.',
    h1: 'Headless CMS: what it is and when you actually need one',
    date: '2026-07-28', readMins: 7, tag: 'Architecture',
    sections: [
      { h: null, p: [
        'Headless CMS gets recommended a lot, often by people who benefit from the extra build hours. It is a genuinely good architecture for some projects and an expensive mistake for others. Here is the honest version.',
        'A traditional CMS like WordPress handles both the content and the pages visitors see. A headless CMS handles only the content, and hands it over through an API for a separate front end to render. Splitting the two is the whole idea.' ]},
      { h: 'What you actually gain', p: [
        'One content source can feed several destinations - a website, a mobile app, in-store screens, a partner feed - without duplicating anything. If you genuinely publish to more than one place, this alone can justify the approach.',
        'The front end is unconstrained by the CMS. Your developers pick the framework and control performance directly, rather than fighting a theme system that was never designed for what you are building.',
        'Security improves, because the editing system is not sitting on the public internet attached to your live site. There is no login page on your domain to be attacked.' ]},
      { h: 'What it costs you', p: [
        'You lose live preview and instant edits unless you build them, and editors notice immediately. On WordPress, someone changes a heading and it is live. On a headless build it may need a deploy, and that friction is real for a marketing team.',
        'You now maintain two systems and pay for both. The CMS is a subscription, the front end needs hosting, and the integration between them is code that someone has to own.',
        'Simple changes get more expensive. Adding a section to a page is a developer task rather than something the client does in an afternoon.' ]},
      { h: 'When it is the right call', p: [
        'Choose headless when you publish the same content to multiple front ends, when you have developers who will own the build long term, or when your performance and scale requirements genuinely exceed what a traditional CMS delivers.',
        'Stay traditional when you have one website, a small team, and non-technical people who need to edit content without waiting on anyone. That describes most businesses, and there is no shame in it.',
        'The failure mode we see most is a small business sold a headless build, then finding every content change needs the agency. If you want to talk through which fits, get in touch.' ]},
    ],
    faq: [
      { q: 'Is headless CMS better for SEO?', a: 'Not inherently. It can be faster, which helps, but headless builds frequently ship with broken meta handling or client-only rendering. A well-built traditional site beats a badly built headless one every time.' },
      { q: 'How much more does a headless build cost?', a: 'Typically 40 to 100 percent more than the equivalent traditional build, because you are building the front end from scratch instead of adapting a theme. Ongoing costs are higher too.' },
      { q: 'Can I move to headless later?', a: 'Yes, and it is often the smarter order. Launch on a traditional CMS, prove the business case, then move the front end once you know what you actually need.' },
    ],
    related: [
      { label: 'WordPress Website Design', href: '/services/wordpress-website-design/' },
      { label: 'Web Application Development', href: '/services/web-application-development/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'ai-in-web-design',
    title: 'AI in Web Design: What It Does Well and Where It Fails | TheBrandle',
    metaDescription: 'An honest look at AI in web design and SEO in 2026 - what it genuinely speeds up, where it produces work you have to redo, and what Google actually penalises.',
    h1: 'AI in web design: what it does well and where it fails',
    date: '2026-07-28', readMins: 7, tag: 'Industry',
    sections: [
      { h: null, p: [
        'We use AI daily. We also spend a fair amount of time undoing what it produced. Both things are true, and most writing on this topic only admits one of them.',
        'Here is where it genuinely helps on a web project, and where it quietly costs more than it saves.' ]},
      { h: 'Where it genuinely helps', p: [
        'Boilerplate code, migrations and repetitive refactors. Anything with a clear pattern and a testable result is where AI earns its keep.',
        'First drafts of structured copy - FAQs, service descriptions, meta descriptions - where a human then edits for voice and accuracy. Starting from a draft is faster than starting from nothing.',
        'Research and comparison. Summarising documentation or gathering competitor structures takes minutes instead of an afternoon.' ]},
      { h: 'Where it fails', p: [
        'Facts and figures. Generated content invents statistics with total confidence, attributes them to plausible-sounding sources, and formats them convincingly. Every number needs checking against a real source before it is published.',
        'Brand voice. AI output has a recognisable cadence, and readers increasingly clock it. For a design studio, publishing obviously generated copy undercuts the exact thing you are selling.',
        'Design judgement. It can produce a competent layout. It cannot tell you that your pricing section is in the wrong place because of how your particular buyers decide.' ]},
      { h: 'What Google actually penalises', p: [
        'Google does not penalise AI-generated content for being AI-generated. It penalises scaled content abuse - mass-produced pages made primarily to rank rather than to help anyone.',
        'The practical line is whether a human took responsibility for the output. Content that was generated, reviewed, corrected and internally linked with intent is fine. A hundred pages published unattended is the risk.',
        'We run generated posts through automated checks that strip outbound links and flag any statistic or client claim for review before publishing. If you want that kind of pipeline set up, see our services.' ]},
    ],
    faq: [
      { q: 'Will Google penalise my AI-written blog?', a: 'Not for using AI. Google targets mass-produced content made only to rank. Reviewed, accurate, genuinely useful content is fine regardless of how the first draft was written.' },
      { q: 'Can AI build my website?', a: 'It can produce something that looks like a website quickly. Turning that into a site that converts, loads fast and reflects your brand is still the hard part, and it is still human work.' },
      { q: 'Should I add an AI chatbot?', a: 'Only if you have enough enquiry volume to justify it and real content for it to answer from. A chatbot that guesses is worse than a contact form that works.' },
    ],
    related: [
      { label: 'SEO Services', href: '/services/seo-services/' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'arabic-rtl-website-design',
    title: 'Arabic & RTL Website Design: Doing It Properly | TheBrandle',
    metaDescription: 'How to design Arabic and right-to-left websites properly - typography, layout mirroring, bilingual structure and the mistakes that make a site look translated.',
    h1: 'Arabic and RTL website design: doing it properly',
    date: '2026-07-28', readMins: 6, tag: 'Localisation',
    sections: [
      { h: null, p: [
        'Most Arabic websites in this region are English sites run through a translation plugin. Arabic readers spot it instantly, and it signals that the business is not really operating in their market.',
        'Doing it properly is not much harder, provided you decide before design starts rather than after.' ]},
      { h: 'RTL is not a mirror', p: [
        'Right-to-left flips the reading order, so navigation, logos, progress indicators and form labels move. But not everything mirrors: phone numbers, times and most numerals stay left-to-right, and mirroring them is a common giveaway.',
        'Icons with direction need thought. A back arrow flips. A play button generally does not. A shopping cart does not. Blanket mirroring produces interfaces that feel subtly wrong.',
        'Build with CSS logical properties from the start. Retrofitting RTL onto a layout written with left and right margins is where projects lose days.' ]},
      { h: 'Arabic typography is different', p: [
        'Arabic is cursive and connected, so letterforms change with position in the word. Font choice matters far more than in Latin type, and a poor Arabic font is much more obviously bad.',
        'Arabic needs more vertical space. The same paragraph in Arabic and English will not occupy the same box, and line-height tuned for Latin type will feel cramped.',
        'Arabic has no capital letters, so any hierarchy you were carrying with uppercase has to come from weight, size or colour instead.' ]},
      { h: 'Structure for two languages', p: [
        'Give each language its own URL - /ar/ and /en/ - and connect them with hreflang tags. Do not swap content at the same URL, because search engines can only index one version.',
        'Translate meaningfully rather than literally. Marketing copy that works in English often reads oddly translated word for word, and machine translation is not adequate for a brand page.',
        'Let users choose and remember the choice. Guessing from IP is frequently wrong in a region with this much movement.' ]},
    ],
    faq: [
      { q: 'Can I just use Google Translate on my site?', a: 'For rough comprehension, maybe. For anything customer-facing, no. Machine translation of marketing copy reads as machine translation, and that damages trust in exactly the market you are trying to win.' },
      { q: 'Does an Arabic version help SEO?', a: 'Yes, if implemented with separate URLs and hreflang. You become eligible for Arabic search results, which are far less competitive than English in most categories here.' },
      { q: 'Which should we build first?', a: 'Whichever your customers actually use. In Saudi that is usually Arabic; in Dubai it is often English. Design for the primary language first and adapt to the second.' },
    ],
    related: [
      { label: 'Web Design Riyadh', href: '/services/web-design-riyadh/' },
      { label: 'Web Design Abu Dhabi', href: '/services/web-design-abu-dhabi/' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
    ],
  },
  {
    slug: 'website-redesign-without-losing-seo',
    title: 'How to Redesign a Website Without Losing SEO | TheBrandle',
    metaDescription: 'A practical checklist for redesigning a website without losing search rankings - URL mapping, redirects, content parity and what to monitor after launch.',
    h1: 'How to redesign your website without losing SEO',
    date: '2026-07-28', readMins: 7, tag: 'SEO',
    sections: [
      { h: null, p: [
        'Traffic collapsing after a redesign is common, avoidable, and almost always caused by the same handful of mistakes. The design is rarely the problem. The migration is.',
        'This is the checklist we work through on every rebuild.' ]},
      { h: 'Before you design anything', p: [
        'Export every existing URL and its traffic. You cannot preserve what you have not written down, and you need the list before the old site is gone.',
        'Identify your top pages by organic traffic and conversions. These get protected. Everything else is negotiable.',
        'Record current rankings for your important terms. Without a baseline, you will not know whether a drop is your redesign or a normal fluctuation.' ]},
      { h: 'Map every URL', p: [
        'Every old URL needs a decision: keep it, redirect it, or let it go. Write this into a spreadsheet and treat it as a deliverable, not an afterthought on launch day.',
        'Use 301 redirects, one hop, pointing at the closest equivalent page. Chained redirects leak authority and a chain of three or more is worth fixing.',
        'Do not redirect everything to the homepage. Google treats a mass redirect to the homepage as a soft 404 and you lose the value entirely.' ]},
      { h: 'Keep the content', p: [
        'The most common cause of a post-redesign drop is simply publishing less content. A cleaner design often means shorter pages, and the page that ranked did so partly because of what it said.',
        'Keep your headings and body copy on pages that rank. Redesign the presentation, not the substance, unless you have a reason to change it.',
        'Carry over titles, meta descriptions and structured data. They are easy to lose in a platform change and easy to check before launch.' ]},
      { h: 'After launch', p: [
        'Submit the new sitemap in Search Console immediately and watch the coverage report daily for the first fortnight. Indexing errors surface there before they show up in traffic.',
        'Expect a small dip for two to four weeks while Google re-crawls. A sustained drop beyond that is a problem to investigate, not a phase to wait out.',
        'Crawl the new site for broken links and orphan pages. If you want this handled properly, see our SEO services.' ]},
    ],
    faq: [
      { q: 'Will I lose rankings when I redesign?', a: 'A short dip while Google re-crawls is normal. A lasting drop means something went wrong in the migration - usually missing redirects or removed content.' },
      { q: 'Should I keep my old URLs?', a: 'If they rank and make sense, yes. Changing URLs for tidiness alone is rarely worth the risk. Change them when the structure is genuinely wrong.' },
      { q: 'How long does recovery take?', a: 'With redirects done properly, most sites are back to baseline within four to six weeks. Without them, recovery can take months and may never fully happen.' },
    ],
    related: [
      { label: 'SEO Services', href: '/services/seo-services/' },
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  /* ---- topic-gap cluster, batch 2 ---- */
  {
    slug: 'website-maintenance-cost',
    title: 'Website Maintenance Cost: What You Actually Need to Pay For | TheBrandle',
    metaDescription: 'What website maintenance really costs, what a care plan should include, and which line items are worth paying for versus padding on an invoice.',
    h1: 'Website maintenance: what you actually need to pay for',
    date: '2026-07-28', readMins: 6, tag: 'Pricing',
    sections: [
      { h: null, p: [
        'Website maintenance is one of the vaguest line items in this industry. Quotes range from a token monthly fee to enterprise retainers, and the scope behind them varies enormously.',
        'Here is what genuinely needs doing, what it costs, and which items are padding.' ]},
      { h: 'What actually needs doing', p: [
        'Updates and patches. Platforms and plugins ship security fixes constantly, and an unpatched site is the single most common way small business websites get compromised.',
        'Backups you have actually tested. Almost every host claims backups. Far fewer businesses have ever tried restoring one, and an untested backup is a guess.',
        'Uptime monitoring. If your site goes down at 2am on a Friday, you want to know before a customer tells you on Monday.',
        'Broken things nobody noticed. Contact forms stop working silently. This is worth checking monthly, because a dead form can cost months of enquiries before anyone spots it.' ]},
      { h: 'What is usually padding', p: [
        'Vague "SEO monitoring" with no deliverable. If it does not come with a report of what changed and why, it is a line item rather than work.',
        'Unlimited edits. Nobody offers genuinely unlimited work at a small monthly fee. There is a cap somewhere, and it is better stated plainly as a number of hours.',
        'Security suites that duplicate your host. Many managed hosts already handle firewalls and malware scanning. Paying twice is common and avoidable.' ]},
      { h: 'What it should cost', p: [
        'A small brochure site on a modern platform needs relatively little - updates, backups, monitoring and a small allowance for changes. Expect a modest monthly figure.',
        'WordPress and WooCommerce cost more to maintain because there is more to break. Plugin conflicts are real and they need someone to resolve them.',
        'Ecommerce costs more again, because a broken checkout is lost revenue per hour rather than an inconvenience. Faster response times cost more, correctly.',
        'The honest test is whether the plan lists specific deliverables and a response time. If it does not, you are buying reassurance. See our website maintenance service for what we include.' ]},
    ],
    faq: [
      { q: 'Do I really need a maintenance plan?', a: 'If your site is on WordPress or WooCommerce, effectively yes - unpatched plugins are the main attack route. On a hosted platform like Shopify or Framer the platform handles more, so the need is smaller.' },
      { q: 'Can I do maintenance myself?', a: 'You can, if you will genuinely do it monthly and know how to recover from a failed update. The reason most owners pay for it is that it gets skipped until something breaks.' },
      { q: 'What happens if I skip it?', a: 'Usually nothing, for a while. Then a plugin vulnerability gets exploited, or an update breaks the checkout, and the recovery costs more than a year of maintenance would have.' },
    ],
    related: [
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'WordPress Website Design', href: '/services/wordpress-website-design/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'wordpress-vs-webflow',
    title: 'WordPress vs Webflow: An Honest Comparison | TheBrandle',
    metaDescription: 'WordPress vs Webflow compared honestly - cost, editing, SEO, ecommerce and maintenance, with a clear view of which suits which kind of business.',
    h1: 'WordPress vs Webflow: an honest comparison',
    date: '2026-07-28', readMins: 7, tag: 'Platforms',
    sections: [
      { h: null, p: [
        'These two get compared constantly, usually by someone who only builds on one of them. We build on both, so here is the version without a thumb on the scale.',
        'They solve the same problem differently: WordPress gives you ownership and infinite extensibility at the cost of maintenance. Webflow gives you a polished, hosted product at the cost of control.' ]},
      { h: 'Cost over three years', p: [
        'WordPress software is free, but real costs are hosting, premium plugins, and someone to maintain it. Skipping the third is where the savings go and where the security incidents come from.',
        'Webflow is a subscription per site, which looks more expensive on paper and often is not, once maintenance time is counted honestly.',
        'For a simple marketing site, three-year totals usually land closer than either camp admits. For a complex site with many integrations, WordPress typically wins on cost and loses on effort.' ]},
      { h: 'Editing and control', p: [
        'Webflow gives designers precise visual control without touching code, and produces clean output. For design-led marketing sites it is genuinely excellent.',
        'WordPress editing depends entirely on how it was built. A well-built block setup is pleasant. A page-builder-heavy site is slow and fragile, and that is the more common outcome.',
        'Webflow constrains you to what Webflow supports. When you hit that wall, you hit it hard - the workaround is usually a rebuild elsewhere.' ]},
      { h: 'SEO and ecommerce', p: [
        'Both are technically capable. Webflow is fast by default and gives full control of meta and structured data. WordPress can match it but needs configuring, and default setups are often slow.',
        'For ecommerce, neither is the strongest choice. Webflow Ecommerce is limited, and WooCommerce is powerful but heavy. If ecommerce is the main business, look at our Shopify website design service or our WooCommerce website design service instead.' ]},
      { h: 'Which to choose', p: [
        'Choose Webflow for a design-led marketing site where you want it to look sharp, load fast and not think about servers.',
        'Choose WordPress when you need specific functionality, deep integrations, multilingual, or you want to own the whole stack with no per-site subscription.',
        'Ignore anyone who says one is simply better. The right answer depends on who edits it, what it must do, and who maintains it in year two.' ]},
    ],
    faq: [
      { q: 'Is Webflow better for SEO than WordPress?', a: 'Marginally, out of the box, because it is faster by default and has clean markup. A well-built WordPress site matches it. Platform is not what decides your rankings.' },
      { q: 'Can I move from Webflow to WordPress later?', a: 'Yes, but it is a rebuild rather than a migration - the content moves, the design does not. Choose deliberately rather than planning to switch.' },
      { q: 'Which is cheaper long term?', a: 'Once you count maintenance honestly, they are closer than most comparisons suggest. WordPress wins on licence cost and loses on time.' },
    ],
    related: [
      { label: 'Webflow Website Design', href: '/services/webflow-website-design/' },
      { label: 'WordPress Website Design', href: '/services/wordpress-website-design/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'website-total-cost-of-ownership',
    title: 'The Real Cost of a Website Over Three Years | TheBrandle',
    metaDescription: 'The true total cost of owning a website - build, hosting, maintenance, content and the hidden costs most quotes leave out, with a three-year view.',
    h1: 'The real cost of a website over three years',
    date: '2026-07-28', readMins: 6, tag: 'Pricing',
    sections: [
      { h: null, p: [
        'Most website quotes cover the build and stop there. That is the number businesses budget for, and it is usually less than half of what the site actually costs over its life.',
        'Here is the full picture, so you can compare quotes on the same basis.' ]},
      { h: 'The build is the visible part', p: [
        'Design and development is the number on the quote. It varies enormously with scope, and comparing two quotes without comparing scope tells you nothing.',
        'What inflates it legitimately: number of unique page designs, ecommerce complexity, integrations, and whether content and photography exist already.',
        'What should not inflate it: pages that are copies of each other, or a platform chosen because the agency only builds on that one.' ]},
      { h: 'The recurring costs', p: [
        'Hosting or platform fees, monthly or annual, and materially different between a hosted platform and self-managed WordPress.',
        'Maintenance - updates, backups, monitoring and fixes. Real whether you pay someone or absorb the time yourself.',
        'Domain, email, SSL and any paid plugins or apps. Individually small, collectively a real annual number.',
        'Content. The site needs updating, and this is the cost most consistently forgotten at budget time.' ]},
      { h: 'The hidden costs', p: [
        'Change requests. Every site needs changes, and whether they cost you depends entirely on how editable it was built to be. Ask before signing.',
        'Being locked in. A site built so only its creator can maintain it has a switching cost that shows up exactly when the relationship sours.',
        'Rebuilding early. A cheap site that cannot grow gets replaced in eighteen months, and the second build costs more than doing it properly once.' ]},
      { h: 'How to compare quotes properly', p: [
        'Ask every agency for a three-year total: build, hosting, maintenance and expected change requests. The cheapest build is often not the cheapest site.',
        'Ask who owns the code and content, and what happens if you leave. The answer tells you a lot.',
        'Ask what happens when you want to add a page. If that requires the agency, price it in. For a breakdown of local build costs, see our Dubai website cost guide, or get in touch for a fixed quote.' ]},
    ],
    faq: [
      { q: 'What is a realistic annual running cost?', a: 'For a small business site, budget for hosting, maintenance and a content allowance. Ecommerce runs higher because more can break and downtime costs revenue directly.' },
      { q: 'Is a cheap website worth it?', a: 'For validating an idea, sometimes. As the front door of an established business, a site that gets replaced in eighteen months costs more than building it properly once.' },
      { q: 'Should I pay monthly or one-off?', a: 'One-off build plus a maintenance plan is the most common and usually the most transparent. Be careful with monthly plans where you never own the site.' },
    ],
    related: [
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'Web Design Dubai', href: '/services/web-design-dubai/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'real-estate-website-design',
    title: 'Real Estate Website Design: What Actually Converts | TheBrandle',
    metaDescription: 'What works in real estate website design - listing search, lead capture, portal integration and the mistakes that lose enquiries on property websites.',
    h1: 'Real estate website design: what actually converts',
    date: '2026-07-28', readMins: 6, tag: 'Industry',
    sections: [
      { h: null, p: [
        'Property websites have a specific job: help someone find a relevant listing quickly, then make enquiring effortless. Most fail at the first part and then wonder about the second.',
        'This is what matters, based on how property buyers actually behave.' ]},
      { h: 'Search is the whole product', p: [
        'Buyers arrive with criteria - area, budget, bedrooms - and want filtered results in seconds. If filtering is slow or buries the price, they leave for a portal.',
        'Filters must persist. A buyer who refines a search, opens a listing and hits back should return to their results, not a reset form. This single issue loses more enquiries than any design choice.',
        'Show price, area, bedrooms and location in the results, not just on the detail page. People scan before they click.' ]},
      { h: 'Listing pages sell or lose the enquiry', p: [
        'Photography is the product. A gallery that is slow, small or awkward on mobile undermines every other effort, and most property traffic is mobile.',
        'Put the enquiry action where the decision happens - visible without scrolling back up, and on mobile, reachable with a thumb.',
        'Include the practical facts buyers filter on: service charge, handover date, payment plan, developer. Missing details generate emails asking for them, or more often, silence.' ]},
      { h: 'The integration question', p: [
        'Most agencies list on portals as well. Your site should sync with the same source so listings never contradict each other or show properties that have gone.',
        'Feeds break. Whoever builds it should handle failure explicitly, because a listings page that silently empties is worse than one that is briefly out of date.',
        'If you need this connected properly, see our web application development service.' ]},
    ],
    faq: [
      { q: 'Should we build our own site if we are on the portals?', a: 'Yes. Portals put you next to every competitor and own the relationship. Your own site is where you control presentation and keep the lead.' },
      { q: 'Can our website pull listings automatically?', a: 'Usually yes, if your CRM or portal exposes a feed or API. It is worth confirming before design begins, since it shapes the build.' },
      { q: 'What matters most for property SEO?', a: 'Area and development pages with genuinely useful local content, fast mobile performance, and structured data on listings so they can appear richly in results.' },
    ],
    related: [
      { label: 'Web Application Development', href: '/services/web-application-development/' },
      { label: 'Web Design Dubai', href: '/services/web-design-dubai/' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design/' },
    ],
  },
  /* ---- topic-gap cluster, batch 3 ---- */
  {
    slug: 'core-web-vitals-guide',
    title: 'Core Web Vitals: What They Are and How to Fix Them | TheBrandle',
    metaDescription: 'A practical guide to Core Web Vitals - LCP, INP and CLS explained in plain English, what causes bad scores, and the fixes that actually move the numbers.',
    h1: 'Core Web Vitals: what they are and how to fix them',
    date: '2026-07-28', readMins: 6, tag: 'Performance',
    sections: [
      { h: null, p: [
        'Core Web Vitals are Google\'s attempt to measure whether a page feels fast to a real person. They are a genuine ranking signal, but a modest one - fixing them will not rescue thin content.',
        'They are worth fixing anyway, because they measure things that also cost you conversions.' ]},
      { h: 'The three metrics', p: [
        'LCP, Largest Contentful Paint: how long until the main thing on screen appears. Usually your hero image or heading. Under 2.5 seconds is the target.',
        'INP, Interaction to Next Paint: how quickly the page responds when someone taps or clicks. This replaced FID and is harder to pass, because it measures every interaction rather than the first.',
        'CLS, Cumulative Layout Shift: how much the page jumps around while loading. This is the one users hate most - you go to tap something and an ad loads above it.' ]},
      { h: 'What actually causes bad scores', p: [
        'Oversized images are the most common LCP problem by a distance. A hero exported at 4000 pixels wide and displayed at 1200 wastes most of what it downloads.',
        'Too much JavaScript causes bad INP. Every script the browser parses before responding delays that response, and most sites load several they no longer use.',
        'Images and ads without dimensions cause CLS. If the browser does not know how much space something needs, it reflows when it arrives.',
        'Fonts cause both. A web font that loads late shifts text; one that blocks rendering delays it.' ]},
      { h: 'The fixes that matter', p: [
        'Serve images at the size they display, in a modern format, with width and height attributes set. This alone fixes most LCP and CLS problems on small business sites.',
        'Remove scripts you no longer use. Most sites carry tracking for tools abandoned years ago, each still loading on every visit.',
        'Preload the font you actually use, and set a sensible fallback so text is readable while it loads.',
        'Measure with real user data in Search Console rather than a one-off lab test. Lab tools are useful for diagnosis, but Google ranks on field data. See our SEO services if you want this handled.' ]},
    ],
    faq: [
      { q: 'How much do Core Web Vitals affect rankings?', a: 'They are a real but small signal, mostly acting as a tiebreaker between similar pages. Content relevance matters far more. Fix them for conversions as much as for rankings.' },
      { q: 'Why does my score differ between tools?', a: 'PageSpeed Insights lab tests simulate a slow device. Search Console reports real visitors. The field data is what Google uses.' },
      { q: 'Can a WordPress site pass Core Web Vitals?', a: 'Yes, but it needs work - lean theme, few plugins, optimised images and decent hosting. Passing by default is unusual on WordPress.' },
    ],
    related: [
      { label: 'SEO Services', href: '/services/seo-services/' },
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'progressive-web-apps',
    title: 'Progressive Web Apps: Do You Need One? | TheBrandle',
    metaDescription: 'What a progressive web app is, how it compares to a native mobile app, and the honest cases where a PWA is the right choice for a business.',
    h1: 'Progressive web apps: do you actually need one?',
    date: '2026-07-28', readMins: 6, tag: 'Architecture',
    sections: [
      { h: null, p: [
        'A progressive web app is a website that behaves more like an app - installable to the home screen, works offline, can send push notifications. No app store required.',
        'It is often pitched as a cheaper alternative to a native app. Sometimes that is true. Often the honest answer is that you need neither.' ]},
      { h: 'What a PWA gives you', p: [
        'No app store. No review process, no rejection, no 15 to 30 percent commission on anything you sell. You ship updates whenever you like.',
        'One codebase for every platform, and it is your existing website. That is a large cost saving compared with building for iOS and Android separately.',
        'Discoverable through search, because it is still a website. Native apps are invisible to Google.' ]},
      { h: 'What you give up', p: [
        'Deep device features. Access has improved, but anything relying on advanced hardware integration or background processing still favours native.',
        'Discovery through the app stores, which matters for consumer products where people browse for apps rather than search the web.',
        'Perceived legitimacy. For some audiences, "it is in the App Store" still carries weight that a home-screen bookmark does not.',
        'iOS support lags Android on several PWA capabilities, and if your audience is iOS-heavy, test before committing.' ]},
      { h: 'The honest recommendation', p: [
        'For most businesses, a fast, well-built mobile website does the job and a PWA adds little. The install prompt is rarely accepted by people who visit occasionally.',
        'A PWA makes sense when people use your service repeatedly - ordering, booking, checking something regularly - and offline or notifications genuinely help.',
        'Go native when you need device features, App Store presence, or your audience expects an app. If you are weighing it up, see our mobile app development service or get in touch.' ]},
    ],
    faq: [
      { q: 'Is a PWA cheaper than a native app?', a: 'Usually substantially, because it builds on your existing site rather than two separate codebases. The saving is real but so are the capability limits.' },
      { q: 'Can a PWA go in the App Store?', a: 'It can be wrapped for submission, though Apple applies scrutiny to apps that are mainly a website. It is not a reliable route to store presence.' },
      { q: 'Do PWAs help SEO?', a: 'The performance work usually involved helps. Being a PWA is not itself a ranking factor.' },
    ],
    related: [
      { label: 'Mobile App Development', href: '/services/mobile-app-development/' },
      { label: 'Web Application Development', href: '/services/web-application-development/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
  {
    slug: 'website-security-checklist',
    title: 'Small Business Website Security Checklist | TheBrandle',
    metaDescription: 'A practical website security checklist for small businesses - the realistic threats, the fixes that matter most, and what to do if you are compromised.',
    h1: 'Website security: a practical checklist for small businesses',
    date: '2026-07-28', readMins: 6, tag: 'Security',
    sections: [
      { h: null, p: [
        'Small business sites rarely get targeted deliberately. They get caught by automated scanners looking for known vulnerabilities across millions of sites at once.',
        'That is good news, because defending against automation is mostly about not being the easy option.' ]},
      { h: 'The basics that stop most attacks', p: [
        'Keep everything updated. Outdated plugins are the single most common way WordPress sites are compromised, and the vulnerabilities are public before they are exploited.',
        'Use strong, unique passwords and two-factor authentication on admin accounts. Credential reuse from an unrelated breach is a common entry route.',
        'Remove what you do not use. Every inactive plugin, theme and dormant admin account is surface area for no benefit.',
        'Use HTTPS everywhere, and check that it has not quietly expired.' ]},
      { h: 'Backups are the actual insurance', p: [
        'Automated, off-site, and tested. A backup on the same server as the site is not a backup if the server is what fails.',
        'Test a restore before you need one. An untested backup is a hope, and discovering it is broken during an incident is the worst possible timing.',
        'Keep several versions. Compromises are often noticed days later, by which point recent backups may contain the problem.' ]},
      { h: 'If you get compromised', p: [
        'Take the site offline or into maintenance mode. Leaving a compromised site serving visitors risks them and your reputation.',
        'Restore from a clean backup rather than trying to clean the live site. Removing injected code by hand almost always misses something.',
        'Change every credential afterwards - hosting, CMS, database, FTP - and only then investigate how it happened.',
        'For ongoing patching and monitoring, see our website maintenance service.' ]},
    ],
    faq: [
      { q: 'Do I need a security plugin?', a: 'A reputable one adds value on WordPress, but it is not a substitute for updates and backups. Plugins cannot protect an unpatched site.' },
      { q: 'Is my site too small to be a target?', a: 'No, because you are not being chosen. Automated scanners test millions of sites for known vulnerabilities without caring who owns them.' },
      { q: 'Is hosted platform hosting safer?', a: 'Generally yes for the platform layer - Shopify, Framer and similar patch their own infrastructure. Your accounts and passwords are still your responsibility.' },
    ],
    related: [
      { label: 'Website Maintenance', href: '/services/website-maintenance/' },
      { label: 'WordPress Website Design', href: '/services/wordpress-website-design/' },
      { label: 'All Services', href: '/services/' },
    ],
  },
];

module.exports = { posts };
