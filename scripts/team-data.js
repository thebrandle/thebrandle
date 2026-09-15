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
    name: 'Muteeb',
    role: 'Founder',
    location: 'Dubai, UAE',
    photo: null,
    // Drawn only from copy already published on /about. Muteeb should replace
    // this with how he actually wants to be introduced.
    bio: [
      'Muteeb founded TheBrandle and leads design and build on every project.',
      'The approach has not changed since the studio started: work out what the thing needs to do, who will use it, and how to make it as simple and effective as possible. If custom code is needed, we write it. If something works out of the box, we do not reinvent it.',
    ],
    links: [],
  },
  {
    slug: 'raheem-dzhairkhanov',
    name: 'Raheem Dzhairkhanov',
    role: 'Chief of Media',
    location: 'Dubai, UAE',
    photo: null,
    // Written from his Behance headline ("Videographer, Journalist, Media
    // Specialist"), his stated location, and what his ten published projects
    // actually are. His profile carries no biography, no skills list and no
    // years of experience, so none are claimed here.
    //
    // His event and interview work - ByBit, CoinMarketCap x Binance, RWA
    // Unveil, Pavel Durov - was shot at TheBlock FZCO, not at TheBrandle.
    // Those names must not appear on this site as TheBrandle clients.
    bio: [
      'Raheem is a videographer and journalist based in Dubai, and leads media at TheBrandle.',
      'He shoots event films, founder interviews and behind-the-scenes content, alongside brand and venue work for cafes, bars and barbershops across the city. His job here is to plan a shoot around the deliverables a brand actually needs, then cut it for social as well as the site.',
    ],
    links: [
      { label: 'Behance', href: 'https://www.behance.net/rakhimsky95' },
    ],
  },
];

module.exports = { TEAM };
