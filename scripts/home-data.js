// Homepage copy - consumed by gen-homepage.js.
//
// Everything here is lifted from the live Framer homepage as it rendered on
// 2026-10-05, except four changes Muteeb approved on 2026-10-05:
//   1. Success stories dropped. They were the Framer template's placeholder
//      testimonials (invented people and results), not clients.
//   2. Video production added as service 05 (Raheem's service).
//   3. Process step copy taken from the service pages (PROCESS in
//      service-pages-data.js). Steps 01 and 03 on the live page repeated the
//      pricing subtitle, a template leftover.
//   4. The 7+ years card said "Decades of experience". Reworded to match the
//      number. The numbers themselves were confirmed accurate.
// And one Muteeb asked for on 2026-10-11 ("fix them", on the Seobility report):
//   5. Hero tagline "We create digital designs" became "Our studio creates
//      designs", so every word of the H1 (Digital Design Studio) also appears in
//      the page text. Same length on purpose: it wraps exactly like the old line
//      at every width from 375 to 1920px. "digital" is still used further down.
// Em dashes are not used anywhere on this site; esc() also normalises them.

const { PROCESS } = require('./service-pages-data');

const IMG = '/framerusercontent.com/images/';

module.exports = {
  // Same title and description the Framer homepage carries today. Both were
  // sized to pass Seobility's pixel-width checks (title <= 580px at 20px Arial,
  // description <= 1000px at 14px Arial) - re-measure before changing either.
  meta: {
    title: 'Branding, UX/UI & Web Design Studio | TheBrandle',
    description: 'Dubai studio for branding, UX/UI and web design. Custom websites on Framer, Webflow, Shopify and WordPress, built in-house at a fixed price.',
  },

  hero: {
    line1: 'Digital',
    line2: 'Design Studio',
    tags: ['UX/UI Design', 'Development', 'Brand Identity Design', 'Ongoing Support'],
    tagline: 'Our studio creates designs that help brands move faster and convert better. Your business deserves more than just a website. It needs results.',
    video: 'https://assets.thebrandle.com/herovideo.mp4',
    image: IMG + 'MRuoFuMbnw5FFImDwyAVxU4sYs.jpg',
    imageAlt: 'Woman lit in orange and blue light, the studio showreel still',
    noise: IMG + 'WXwwArEbCEXxVkbbiaI5FD2o.png',
  },

  numbers: {
    heading: 'Our work speaks through numbers. Here’s what we’ve achieved so far.',
    cta: { label: 'Let’s talk', href: '/contact' },
    stats: [
      { value: 17, decimals: 0, suffix: '+', title: 'Websites launched', body: 'Helping brands make their mark online.' },
      { value: 1.2, decimals: 1, suffix: 'M+', title: 'Users reached', body: 'Our designs engage millions globally.' },
      { value: 98, decimals: 0, suffix: '%', title: 'Client satisfaction rate', body: 'We build long-term partnerships through proven results.' },
      { value: 7, decimals: 0, suffix: '+', title: 'Years of expertise', body: 'Seven years of delivering impactful digital solutions.' },
    ],
  },

  statement: {
    line1: 'From ordinary',
    line2: 'to extraordinary',
    image: IMG + 'GdqNUII0Rq3ISDD0FNEyWMVdWdQ.jpg',
    imageAlt: 'Black cosmetic product bottle against a dark background',
    sub: 'Design that’s built to last and grow with your business',
  },

  benefits: {
    heading: 'Your goals, our priority',
    sub: 'From concept to launch, we’re committed to your success with rapid response times and personalized attention to detail.',
    care: {
      title: '24/7 priority care',
      body: ['Receive priority treatment for urgent tasks, with an ', 'average response time of 24 hours', ' for high-priority clients.'],
      image: IMG + 'Lpb2prDXL2p8hnnWcYXnIO6f0Q.png',
      grid: IMG + 'febsTulDmLM5GKKVYjsE85lLAk.svg',
    },
    tweaks: {
      title: 'Tailored tweaks for perfection',
      body: ['Request custom revisions at any time. We provide ', 'up to 5 minor revisions', ' post-launch to keep things looking fresh.'],
      avatars: ['2AYuIsYxoyH0AB4UH3OZXNPNbAo.jpg', 'o8dFjBzWHUDItoXVX8r1Ndzlk.jpg', '0pDtIhqRHGNuPAzd4BSRF7WMlXk.jpg', 'EagZOs8hT2OPs3zEGfOxlGf3Bc8.jpg'].map((f) => IMG + f),
      listTitle: 'Post-Launch requests',
      done: ['Align text margins properly', 'Increase mobile menu font size', 'Replace images'],
      todo: ['Fix button color: #F9452D', 'Speed up page loading'],
      validity: 'Valid for 3 months after launch',
    },
    kit: {
      label: 'Download brand kit',
      count: 6,
      title: 'Brand kit at your fingertips',
      body: ['Receive a full branding toolkit, from logos to color schemes and typography, ', 'download all assets', ' or share them with your team.'],
    },
    support: {
      time: '10:45',
      sender: 'Designer',
      when: 'Today 09:17',
      message: 'Logo update complete, ready for your review!',
      avatar: IMG + 'IOGg7ZpaneY0TlHE5oJ2WoVALk4.jpg',
      face: IMG + 'Ttm9L1HJZLgD0GMqwHKZ0YOw.jpg',
      phone: IMG + 'zqhjvenuB6JlWRw3MCGzn16Xs.png',
      caption: ['Real-Time', 'Support'],
    },
  },

  work: {
    label: 'Selected work',
    heading: ['Proven results,', 'stunning designs'],
    year: '2K26',
    projects: [
      { title: 'Shine Skincare Branding', body: 'High quality cosmetics brand created for independent and brave women.', tag: 'Branding', href: '/projects/shine-skincare-branding', image: '/assets/projects/shine/bg.gif', alt: 'Shine Skincare branding project' },
      { title: '“Oh My Pasta.” Branding', body: 'A unique pasta bar branding project aimed to connect with customers.', tag: 'Branding', href: '/projects/oh-my-pasta-branding', image: '/assets/projects/apex/project2_01.gif', alt: 'Oh My Pasta branding project' },
      { title: 'DropX Website Design', body: 'A sleek and stylish landing page design for high-conversion digital products.', tag: 'Web design', href: '/projects/dropx-website-design', image: '/assets/projects/dropx/image3.webp', alt: 'DropX website design project' },
      { title: 'ORBLEAD Website Design', body: 'A simple minimalistic SaaS lead generation website design.', tag: 'Web design', href: '/projects/orblead-website-design', image: '/assets/projects/orblead/image1.webp', alt: 'ORBLEAD website design project' },
    ],
    all: { label: 'All cases', href: '/projects' },
  },

  services: {
    label: 'Services',
    items: [
      { title: 'Branding', body: 'We create impactful brand identities that differentiate your business and connect with your audience.', image: IMG + 'T5XSyGg3skqWFq4gynSvi2wGqHU.jpg', alt: 'Branded coffee pouch on a red background', href: '/services/brand-identity-design/' },
      { title: 'Development', body: 'From front-end interactions to back-end functionality, we deliver robust solutions that grow with your business.', image: IMG + 'SVNjJOBLJO0tL5qGNY8CExU1fA.jpg', alt: 'Website code on a monitor', href: '/services/web-application-development/' },
      { title: 'Websites', body: 'We build custom websites that go beyond aesthetics, balancing design and functionality to captivate your audience and drive engagement.', image: IMG + 'F5zSpVx8lP6Sy03URQXBu2RRUbg.jpg', alt: 'Laptop showing a website on a pink background', href: '/services/' },
      { title: 'Design support', body: 'We’re here to help with everything from small updates to full-scale redesigns, tailored to your evolving needs.', image: IMG + 'AlJTmhoexT1QmxuwZ7OiLjeKtUM.jpg', alt: 'Hands working on a laptop', href: '/services/website-maintenance/' },
      { title: 'Video production', body: 'We shoot event films, founder interviews and brand content in Dubai, cut for social as well as your site.', image: '/assets/video/beincrypto.jpg', alt: 'Frame from an interview film shot by TheBrandle', href: '/services/video-production/' },
    ],
    cta: { label: 'See pricing', href: '#pricing' },
  },

  quote: {
    text: 'Thebrandle helps companies create stunning and strategically sound experiences that engage audiences. Our experts work closely with you to ensure that every detail is aligned with your goals.',
    sub: 'From concept to launch, we craft digital solutions that not only look exceptional but also drive results, building connections that last.',
    by: 'The Brandle Team',
    image: '/framerusercontent.com/assets/brandlepic.png',
    imageAlt: 'TheBrandle wordmark on soft grey silk',
  },

  pricing: {
    heading: 'Flexible pricing',
    sub: ['Choose the plan that best fits your needs.', 'From a solid foundation to a fully optimized solution'],
    tiers: ['Build', 'Grow'],
    // One entry per plan; each field holds [Build, Grow].
    plans: [
      {
        name: 'Basic', badge: null, featured: false,
        price: ['$799', '$999'],
        blurb: ['For startups building their first digital presence.', 'For startups who need to launch fast, without cutting corners.'],
        features: [
          ['Competitor analysis', 'Design of homepage + up to 3 inner pages', 'Creation of custom page prototypes', 'Basic analytics setup (e.g., Google Analytics)', 'Setup of a basic contact form', 'Bug fixing and testing support'],
          ['Everything in Build Basic', 'Faster delivery with priority scheduling', '1 additional round of revisions', 'Basic on-page SEO setup', 'Dedicated point of contact throughout the project'],
        ],
      },
      {
        name: 'Pro', badge: 'Most popular', featured: true,
        price: ['$1,499', '$1,999'],
        blurb: ['For growing businesses ready to make a real impact.', 'For businesses that want more reach and a stronger brand presence.'],
        features: [
          ['Everything in Basic', 'Up to 7 pages, fully customized', 'Social media integration', 'Optimized mobile and tablet versions', 'Enhanced SEO for core pages', 'Custom email template design for leads'],
          ['Everything in Build Pro', 'Expedited project timeline', 'Up to 10 pages, fully customized', 'Basic blog design + setup', '30 days of post-launch support', 'Priority revisions during the design phase'],
        ],
      },
      {
        name: 'Max', badge: 'Premium', featured: false,
        price: ['$2,999', '$3,799'],
        blurb: ['For founders who want to make a serious first impression.', 'For established founders who demand precision, craft, and results.'],
        features: [
          ['Everything in Pro', 'Custom blog design + setup', 'Monthly analytics + performance reporting', 'E-commerce functionality (if needed)', 'Unlimited revisions during the design phase', 'Priority support for 45 days post-launch'],
          ['Everything in Build Max', 'White-glove onboarding + strategy call', 'Premium micro-animations and interactions', 'Advanced e-commerce setup (if needed)', 'Monthly analytics report for 3 months', 'Priority support for 60 days post-launch'],
        ],
      },
    ],
    cta: { label: 'Choose this plan', href: '/contact' },
    included: 'What’s Included:',
  },

  process: {
    heading: 'Our process',
    sub: 'Our four-step process keeps you informed and involved at every stage, ensuring the final result meets your goals and resonates with your audience.',
    cta: { label: 'Schedule a consultation', href: '/contact' },
    // Homepage titles kept; bodies are the service pages' process copy.
    steps: ['Discovery & Strategy', 'Design & Prototyping', 'Development & Integration', 'Launch & Support'].map((title, i) => ({ title, body: PROCESS[i].body })),
  },

  faq: {
    heading: 'FAQ',
    sub: 'We’ve heard it all. Here’s everything you need to know before working with us.',
    cta: { label: 'Ask a question', href: '/contact' },
    items: [
      { q: 'What’s your process for designing and developing a new website?', a: 'We start by understanding your brand and goals, then create a tailored design that reflects your vision. Once the design is approved, we develop the site with clean, scalable code and ensure it’s fully tested before launch.' },
      { q: 'What if I need to make changes or add features in the future?', a: 'We design with scalability in mind, making it easy to add new features as your business grows. We also offer ongoing support packages if you’d like us to handle updates for you.' },
      { q: 'Do you offer SEO services?', a: 'Yes, we incorporate SEO best practices into every website we build to help improve your search visibility from the start. For more advanced SEO strategies, we also offer customized SEO packages.' },
      { q: 'How long does it typically take to see results from my brand’s new website?', a: 'Most clients start seeing results within a few months as search engines index the site and new visitors discover the brand. However, results can vary depending on factors like industry and marketing efforts.' },
      { q: 'How do you ensure the website is mobile-friendly?', a: 'We use responsive design techniques and thoroughly test on various devices and screen sizes. This ensures your site looks great and works well for all users, no matter how they access it.' },
    ],
  },

  contact: {
    label: 'Contact us',
    heading: 'Let’s bring your vision to life',
    body: 'We are here to ensure your experience with us is smooth and successful. Reach out anytime - We’re here to make sure you feel confident and supported throughout your journey with us.',
    image: IMG + 'rp4zyOdeyfzpa7PQUF4DNepU80.jpg',
    fields: { name: 'Name *', email: 'E-mail *', message: 'Message (Tell us about your project)' },
    submit: 'Get in touch',
  },
};
