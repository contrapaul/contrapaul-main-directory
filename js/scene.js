// SVG markup for the map. Pure: positions are applied later, every frame.
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

export function buildScene(nodes, { orbits }) {
  let rings = '', links = '', bodies = '';
  for (const n of nodes) {
    const o = orbits.get(n.id);
    const hue = `style="--hue:${Number(n.hue)}"`;
    if (o.ring) rings += `<circle class="ring" data-id="${esc(n.id)}" r="${o.ring.toFixed(1)}" ${hue}/>`;
    if (n.parent) links += `<path class="link" data-id="${esc(n.id)}" ${hue}/>`;
    bodies += `<g class="node node--${esc(n.kind)}" data-id="${esc(n.id)}" ${hue}>`
      + `<a href="#${esc(n.id === 'root' ? 'map' : n.id)}" aria-label="${esc(n.label)}">`
      + `<circle class="hit" r="${o.r}"/>`
      + `<circle class="halo" r="${(o.r * 2.4).toFixed(1)}"/>`
      + `<circle class="body" r="${o.r}"/>`
      + `<text class="label" text-anchor="middle">${esc(n.label)}</text>`
      + '</a></g>';
  }
  return `<g class="rings">${rings}</g><g class="links">${links}</g><g class="nodes">${bodies}</g>`;
}

// A curved link from parent p to child c, bowed sideways like a spiral arm.
export function linkPath(p, c, bend = 0.22) {
  const mx = (p.x + c.x) / 2, my = (p.y + c.y) / 2;
  const dx = c.x - p.x, dy = c.y - p.y;
  const qx = mx - dy * bend, qy = my + dx * bend;
  return `M${p.x.toFixed(1)} ${p.y.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
}
