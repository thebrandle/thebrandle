/**
 * FAQ page content.
 *
 * Rule for this file: every answer is either a commitment the user confirmed
 * directly, or a claim already published on a service page. Nothing is
 * invented. Where a service page already answers a question, the wording here
 * stays consistent with it so the two cannot contradict each other.
 *
 * Confirmed by the user: team is fully in-house; two revision rounds per
 * stage; 30 days of free post-launch fixes; one business day response.
 */
const FAQ_GROUPS = [
  {
    heading: 'About TheBrandle',
    items: [
      { q: 'What services does TheBrandle offer?',
        a: 'Brand identity, UI/UX design, and website design and development including ecommerce - plus mobile apps, web applications, B2B and B2C portals and payment gateway integration. Branding, design and build happen under one roof rather than being split across separate vendors.' },
      { q: 'Is the team in-house, or is work outsourced?',
        a: 'In-house. The people who design your project are the people who build it. Nothing is handed off to an outside vendor part-way through.' },
      { q: 'Do you handle digital marketing and SEO as well as the build?',
        a: 'Yes, directly rather than through a referral - SEO, digital marketing and social media are services we run ourselves. Branding and UI/UX still come first: a website is built on a coherent brand direction, not treated as a standalone deliverable.' },
      { q: 'Do you work with startups, or only established businesses?',
        a: 'Startups, founders and product launches are a core part of the work, alongside SMBs and established brands. Framer in particular is our fastest route to a polished site on a tight timeline.' },
      { q: 'Do you work with clients outside the UAE?',
        a: 'Yes. We are based in Dubai and work across the UAE, Saudi Arabia and internationally, with dedicated pages for Dubai, Abu Dhabi and Riyadh. Being in Dubai means you can meet, call in your hours and get replies during the working week here rather than overnight from another timezone.' },
    ],
  },
  {
    heading: 'Getting started',
    items: [
      { q: 'How does a project start, and what is in the proposal?',
        a: 'It starts with your business goals rather than just the visual brief - your audience, what the site needs to do commercially, and any technical requirements - before design begins. You get a written scope and a fixed quote before any work starts, so there is nothing to dispute later.' },
      { q: 'I do not have a clear brief yet. Can you still help?',
        a: 'Yes. Many clients arrive with an idea rather than a finished brief. Shaping that into a workable scope and direction is part of the process, not something you need to have solved before getting in touch.' },
      { q: 'What if my project is complex, technical, or does not fit a standard template?',
        a: 'We build web applications, B2B and B2C portals, payment gateway integrations and custom functionality beyond a standard site. If your existing systems have an API or database access we can usually integrate with them - we confirm exactly what is possible during discovery, before you commit to a build.' },
    ],
  },
  {
    heading: 'Pricing and timelines',
    items: [
      { q: 'How much does a website cost?',
        a: 'It depends on scope - a new brand identity plus a full custom site is a different project from a redesign or a landing page. Template builds start low, custom design and build typically runs mid four to low five figures AED, and ecommerce goes higher. Every project is scoped up front and quoted at a fixed price before work begins.' },
      { q: 'Is TheBrandle competitively priced for the Dubai market?',
        a: 'We are not the cheapest option in Dubai and do not try to be. What you get instead is a fixed, transparent price agreed before work starts, with no additions appearing part-way through.' },
      { q: 'How long does a typical project take?',
        a: 'A custom marketing site usually runs about 3 to 6 weeks from kickoff to launch, and a custom Shopify store is similar. App and web application MVPs run to a few months, phased so you see working software early. The timeline is agreed before we start, and how quickly we get content and feedback affects it.' },
      { q: 'Do you charge extra for revisions?',
        a: 'Two rounds of revisions are included at each stage of the project. If you want changes beyond that, or the scope itself changes, we quote it before doing the work - nothing is billed without your approval first.' },
    ],
  },
  {
    heading: 'Process and communication',
    items: [
      { q: 'How will we communicate during the project?',
        a: 'You get one point of contact rather than being passed around, and updates at each stage of the project rather than silence until delivery.' },
      { q: 'Will I see progress before the final delivery?',
        a: 'Yes. Work is shown at defined stages rather than held back for a single final reveal, and those stages are where your revision rounds sit - so feedback lands while it is still cheap to act on.' },
      { q: 'Do you use templates, or is everything custom-built?',
        a: 'We build custom, lightweight themes designed to your brand rather than bloated multipurpose templates that hurt speed and security. Where a platform like Squarespace or Wix is the right fit for your budget, we still go well beyond stock styling so the result does not look off-the-shelf.' },
    ],
  },
  {
    heading: 'Ecommerce and technical capability',
    items: [
      { q: 'Which ecommerce platforms do you work with?',
        a: 'Mainly Shopify and WooCommerce. Shopify for reliability and ease of running day to day; WooCommerce when you need deep WordPress and content integration, full ownership and no platform fees. We advise on the right fit during discovery rather than defaulting to what we prefer to build.' },
      { q: 'Can you build an ecommerce site with a large product catalogue?',
        a: 'Yes. Cost and timeline scale with catalogue size, custom features and integrations, which is exactly what the scoping stage is for - so the quote reflects your actual catalogue rather than a generic build.' },
      { q: 'Can you migrate my existing store to another platform?',
        a: 'Yes - from WooCommerce, Wix, Squarespace and other platforms. Products, collections, customers and URLs move across with redirects in place so you keep your SEO and traffic.' },
    ],
  },
  {
    heading: 'After launch',
    items: [
      { q: 'Does support end once the website goes live?',
        a: 'No. For 30 days after launch we fix bugs and anything that does not work as originally scoped, at no extra cost. You are not asked to pay to make the thing you commissioned work properly.' },
      { q: 'What is covered by support, and what counts as a new paid project?',
        a: 'Covered at no cost: bugs, and functionality that did not work as originally scoped. Charged separately: new features, redesigns and additions to the scope. We tell you which category a request falls into, and quote it, before doing the work.' },
      { q: 'What happens if something stops working after launch?',
        a: 'Report it and you get a response within one business day. Within the first 30 days, in-scope fixes are made at no cost; beyond that they are covered by a maintenance plan or quoted before any work is done.' },
      { q: 'Do you offer ongoing maintenance plans?',
        a: 'Yes - updates, security patches, monitoring and content changes. We audit the site first and then quote a fixed monthly figure, and nothing outside the plan is billed without your approval. We also maintain sites we did not build, on most mainstream platforms.' },
      { q: 'Who owns the website and the code once it is delivered?',
        a: 'You do. On final payment you own the codebase and we hand over the repository, along with source and export files for any brand work. You are never locked to us to keep it running.' },
    ],
  },
  {
    heading: 'Switching from another agency',
    items: [
      { q: 'I have had a bad experience with another web agency. How is TheBrandle different?',
        a: 'The things that usually go wrong are agreed in writing before work starts rather than negotiated after something breaks: a written scope and fixed quote, two revision rounds per stage, 30 days of post-launch fixes at no cost, and a response within one business day. If you are mid-project or unhappy with an existing site, we can take over an existing build rather than starting from zero.' },
      { q: 'Can I see examples of past work?',
        a: 'Yes - recent projects are on the projects page, and the blog covers how we approach platform choice, cost and redesigns in more detail.' },
    ],
  },
];

module.exports = { FAQ_GROUPS };
