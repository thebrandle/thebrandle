// Team members - consumed by gen-service-pages-v2.js (renderTeam).
//
// SOURCING RULE, same as faq-data.js: nothing here may be invented. Every line
// is either (a) confirmed by Muteeb, or (b) already published on thebrandle.com.
// Biographies are about real, named people, so a plausible-sounding detail that
// nobody confirmed is not a small error - it is a false public statement about
// someone. If a fact is not in one of those two buckets, leave it out.
//
// `photo` is a path under /assets/team/. When it is null the page renders an
// initials monogram instead, which is deliberate: a broken <img> or a stock
// headshot of someone else is worse than an honest placeholder.

const TEAM = [
  {
    slug: 'muteeb',
    name: 'Muteeb Mehraj',
    role: 'Founder / Chief of Design',
    location: 'Dubai, UAE',
    photo: '/assets/team/muteeb.jpg',
    // Drawn only from copy already published on /about. Muteeb should replace
    // this with how he actually wants to be introduced.
    bio: [
      'Muteeb Mehraj founded TheBrandle and leads design and build on every project - branding, UI/UX, websites and app design.',
      'The approach has not changed since the studio started: work out what the thing needs to do, who will use it, and how to make it as simple and effective as possible. If custom code is needed, we write it. If something works out of the box, we do not reinvent it.',
    ],
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/muteebmrj' },
    ],
  },
  {
    slug: 'raheem-dzhairkhanov',
    name: 'Raheem Dzhairkhanov',
    role: 'Co-Founder / Chief of Media',
    location: 'Dubai, UAE',
    photo: '/assets/team/raheem.jpg',
    // Written from his Behance headline ("Videographer, Journalist, Media
    // Specialist"), his stated location, and what his ten published projects
    // actually are. His profile carries no biography, no skills list and no
    // years of experience, so none are claimed here.
    //
    // Muteeb confirmed he is already part of the company, so this reads in the
    // present tense throughout - no "joining", no job-description framing.
    //
    // His event and interview work - ByBit, CoinMarketCap x Binance, RWA
    // Unveil, Pavel Durov - was shot at TheBlock FZCO, not at TheBrandle.
    // Those names must not appear on this site as TheBrandle clients.
    bio: [
      'Raheem is a videographer and journalist based in Dubai. He leads media at TheBrandle.',
      'He shoots event films, founder interviews and behind-the-scenes content, alongside brand and venue work for cafes, bars and barbershops across the city. Every shoot is planned around the deliverables a brand actually needs, then cut for social as well as the site.',
    ],
    // Resolved from the LinkedIn redirect his Behance profile links out to,
    // so this is his profile, not a guess at a vanity slug.
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rakhimdzhairkhanov' },
    ],
  },
];

module.exports = { TEAM };
