// The full map tree. Site nodes come from SITES; everything else is listed here.
// Rule: below the root, id === parent + '/' + slug (children of root are one segment).
// Descriptions marked [Paul] and guessed URLs are placeholders until the
// full node list is copied from plan.json.
import { SITES } from './sites.js';

const root = SITES.find((s) => s.id === 'root');

const EXTRA = [
  { id: 'about', parent: 'root', kind: 'special', label: 'About', url: 'about.html',
    description: 'Paul Kwiatkowski: Design Technology educator, maker and creator based in Shenzhen, China.',
    links: [
      { label: 'MakerWorld', url: 'https://makerworld.com/en/@Contrapaul/upload' },
      { label: 'Instagram', url: 'https://www.instagram.com/contrapaul' },
      { label: 'YouTube', url: 'https://www.youtube.com/@PaulKwiatkowski' },
    ] },
  { id: 'dei', parent: 'root', kind: 'special', label: 'DEI training', url: '/dei/',
    description: 'Staff training on intra-student conflict: scenarios to play through and discuss.' },

  { id: 'blog/iste2526', parent: 'blog', kind: 'page', label: 'ISTE Standards 2026',
    url: 'https://blog.contrapaul.com/posts/iste2526', description: 'A breakdown of how I met technology standards.' },
  { id: 'blog/2025-2026-goals', parent: 'blog', kind: 'page', label: 'SMART Goals 2025-26',
    url: 'https://blog.contrapaul.com/posts/2025-2026-goals', description: 'SMART goals for the 2025-2026 school year.' },

  { id: 'edu/curriculum', parent: 'edu', kind: 'hub', label: 'Curriculum',
    url: 'https://edu.contrapaul.com/curriculum/', description: '[Paul] Curriculum hub description.' },
  { id: 'edu/curriculum/dp', parent: 'edu/curriculum', kind: 'page', label: 'DP Design',
    url: 'https://edu.contrapaul.com/curriculum/dp/',
    description: 'A robust companion to the textbook, with interactive tools and a growing amount of audio content.' },
  { id: 'edu/curriculum/myp', parent: 'edu/curriculum', kind: 'page', label: 'MYP Design',
    url: 'https://edu.contrapaul.com/curriculum/myp/', description: '[Paul] MYP curriculum description.' },
  { id: 'edu/ai', parent: 'edu', kind: 'page', label: 'AI',
    url: 'https://edu.contrapaul.com/ai/', description: '[Paul] AI section description.' },
  { id: 'edu/tools', parent: 'edu', kind: 'hub', label: 'Tools',
    url: 'https://edu.contrapaul.com/tools/', description: 'Web tools built for Design Technology classes.' },
  { id: 'edu/tools/macropad', parent: 'edu/tools', kind: 'page', label: 'ESP32 Macropad Builder',
    url: 'https://edu.contrapaul.com/tools/macropad/',
    description: 'Create wiring diagrams, set functions and produce working code for ESP32 projects.' },
  { id: 'edu/tools/breadboard', parent: 'edu/tools', kind: 'page', label: 'Breadboard',
    url: 'https://edu.contrapaul.com/tools/breadboard/', description: '[Paul] Breadboard tool description.' },
  { id: 'edu/tools/taskanalysis', parent: 'edu/tools', kind: 'page', label: 'Task Analysis',
    url: 'https://edu.contrapaul.com/tools/taskanalysis/', description: '[Paul] Task analysis tool description.' },
  { id: 'edu/tools/dt-ia-guide', parent: 'edu/tools', kind: 'page', label: 'DT IA Guide',
    url: 'https://edu.contrapaul.com/tools/DT-IA-Guide/', description: 'DP Design Technology internal assessment guide.' },
  { id: 'edu/tools/auditorium', parent: 'edu/tools', kind: 'page', label: 'Auditorium Seating',
    url: 'https://edu.contrapaul.com/tools/Auditorium', description: 'Auditorium seating plan builder.' },
  { id: 'edu/tools/central-middlezhong-adventure', parent: 'edu/tools', kind: 'page', label: 'Material Selection Adventure',
    url: 'https://edu.contrapaul.com/tools/central-middlezhong-adventure', description: 'A text adventure about material selection.' },

  { id: 'make/tools', parent: 'make', kind: 'hub', label: 'Tools',
    url: 'https://make.contrapaul.com/tools/', description: '[Paul] Make tools hub description.' },
  { id: 'make/tools/languages', parent: 'make/tools', kind: 'page', label: 'Languages',
    url: 'https://make.contrapaul.com/tools/languages', description: '[Paul] Languages tool description.' },
  { id: 'make/fun', parent: 'make', kind: 'hub', label: 'Fun',
    url: 'https://make.contrapaul.com/fun/', description: '[Paul] Make fun hub description.' },
  { id: 'make/fun/students', parent: 'make/fun', kind: 'page', label: 'Students',
    url: 'https://make.contrapaul.com/fun/students', description: '[Paul] Students page description.' },

  ...['castle-assault', 'recess-dodgeball', 'recess-rivals', 'runestone-expedition', 'void-pirates', 'mortis']
    .map((slug) => ({
      id: `games/${slug}`, parent: 'games', kind: 'page',
      label: slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
      url: `https://games.contrapaul.com/${slug}/`, description: '[Paul] Game description.',
    })),
];

export const NODES = [
  { id: 'root', parent: null, kind: 'root', label: 'contrapaul', site: 'root', hue: root.hue,
    url: root.url, description: root.description },
  ...SITES.filter((s) => s.id !== 'root').map((s) => ({
    id: s.id, parent: 'root', kind: 'site', label: s.id, site: s.id, hue: s.hue,
    url: s.url, description: s.description,
  })),
  ...EXTRA.map((n) => {
    const site = n.parent === 'root' ? n.id : n.id.split('/')[0];
    const hue = SITES.find((s) => s.id === site)?.hue ?? root.hue;
    return { site, hue, ...n };
  }),
];

export function indexNodes(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map(nodes.map((n) => [n.id, []]));
  for (const n of nodes) if (n.parent) children.get(n.parent).push(n.id);
  const ancestors = (id) => {
    const out = [];
    for (let p = byId.get(id)?.parent; p; p = byId.get(p).parent) out.unshift(p);
    return out;
  };
  return { byId, children, ancestors };
}
