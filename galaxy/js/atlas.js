// The conventional map: every node as a nested list, for visitors who would
// rather not fly. Pure and escaped. Also decides which labels the 3D view shows.
import { esc } from './panel.js';
import { hashFor } from './route.js';

export function atlasHTML({ byId, children }) {
  const item = (id) => {
    const n = byId.get(id);
    const kids = children.get(id);
    const visit = n.url
      ? ` <a class="atlas-visit" href="${esc(n.url)}"${/^https?:/.test(n.url) ? ' rel="noopener"' : ''} aria-label="Open ${esc(n.label)}">open</a>`
      : '';
    return `<li style="--hue:${Number(n.hue)}"><a class="atlas-fly" href="${hashFor(id)}">${esc(n.label)}</a>${visit}`
      + (kids.length ? `<ul>${kids.map(item).join('')}</ul>` : '') + '</li>';
  };
  return `<ul class="atlas-tree">${children.get('root').map(item).join('')}</ul>`;
}

// How a node relates to the active one: 'active', 'path' (an ancestor),
// 'child', 'sibling', 'moon' (a grandchild) or 'far'.
export function relation(id, active, { byId }) {
  if (id === active) return 'active';
  const n = byId.get(id), a = byId.get(active);
  for (let p = a.parent; p; p = byId.get(p).parent) if (p === id) return 'path';
  if (n.parent === active) return 'child';
  if (n.parent && n.parent === a.parent) return 'sibling';
  if (n.parent && byId.get(n.parent).parent === active) return 'moon';
  return 'far';
}

// Labels shown as links. Other stars are hidden once you are inside a system.
export function showsLabel(rel, id, active, index) {
  if (rel === 'active' || rel === 'child') return true;
  if (rel === 'path') return id !== 'root' || active === 'root';
  if (rel === 'sibling') return index.byId.get(active).parent !== 'root';
  return false;
}
