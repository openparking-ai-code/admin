// The owner's pages, in the order the side navigation shows them.
//
// A page's words live in the dictionaries under `page.<id>.title`,
// `page.<id>.purpose` and `page.<id>.words` (the other things a person might
// type to find it, comma-separated). Nothing readable is kept here.

export const PAGES = [
  { id: 'home', path: '/', icon: 'home' },
  { id: 'setup', path: '/setup', icon: 'check' },
  { id: 'garages', path: '/garages', icon: 'garage' },
  { id: 'lanes', path: '/lanes', icon: 'lane' },
  { id: 'drawings', path: '/installer-drawings', icon: 'drawings' },
  { id: 'readers', path: '/card-readers', icon: 'card' },
  // the approved Rates page has its title alone, no line under it.
  { id: 'rates', path: '/rates', icon: 'rate', noPurpose: true },
  { id: 'taxes', path: '/taxes', icon: 'tax' },
  { id: 'paid', path: '/getting-paid', icon: 'paid' },
  // Garage View, once "Cars inside": its old address still opens it.
  { id: 'inside', path: '/garage-view', was: ['/cars-inside'], icon: 'car' },
  // Platform 0043's stuck stays: HELD, not in the menu (the owner, 2026-11-09: "why is that?
  // there is no such a thing", and "no" to writing a stay off). StuckPage.jsx stays in the tree
  // for the garage walk he will go through in detail; the platform holds its doors off too
  // (platform src/held.js). Its old address opens Home.
  // the cars banned at this garage, and taking one off the list.
  { id: 'banned', path: '/banned-cars', icon: 'ban' },
  // Platform 0048: every car a person let out, and what happened, read only.
  { id: 'exceptions', path: '/exceptions', icon: 'barrier' },
  { id: 'alerts', path: '/alerts', icon: 'bell' },
  { id: 'changes', path: '/change-log', icon: 'log' },
  // the language and the look, once at the top of every page.
  { id: 'settings', path: '/settings', icon: 'settings' },
];

export const HOME = PAGES[0];

/** The page a location hash points at (by its address, or one it had before), or Home for anything unknown. */
export function pageForHash(hash) {
  const path = String(hash ?? '').replace(/^#/, '') || '/';
  return PAGES.find((p) => p.path === path || p.was?.includes(path)) ?? HOME;
}

export const hashFor = (page) => `#${page.path}`;
