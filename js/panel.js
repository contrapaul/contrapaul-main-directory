// Panel HTML for the active node. Pure and escaped.
import { esc } from './scene.js';
import { hashFor } from './route.js';

const external = (url) => /^https?:/.test(url);
const linkAttrs = (url) => (external(url) ? ' rel="noopener"' : '');

export function panelHTML(id, { byId, children, ancestors }) {
  const n = byId.get(id);
  const kids = children.get(id);
  const crumbs = [...ancestors(id), id].map((a, i, all) => {
    const label = a === 'root' ? 'Map' : byId.get(a).label;
    return i === all.length - 1
      ? `<li aria-current="page">${esc(label)}</li>`
      : `<li><a href="${hashFor(a)}">${esc(label)}</a></li>`;
  }).join('');

  let body = `<p class="panel-desc">${esc(n.description)}</p>`;
  if (kids.length) {
    body += '<ul class="panel-list">' + kids.map((k) => {
      const c = byId.get(k);
      const more = children.get(k).length ? ` <span class="count">${children.get(k).length}</span>` : '';
      return `<li style="--hue:${Number(c.hue)}"><a href="${hashFor(k)}">${esc(c.label)}${more}</a>`
        + `<span>${esc(c.description)}</span></li>`;
    }).join('') + '</ul>';
    if (n.url) body += `<p><a class="panel-go" href="${esc(n.url)}"${linkAttrs(n.url)}>Visit ${esc(hostLabel(n))}</a></p>`;
  } else {
    body += media(n);
    if (n.links) {
      body += '<ul class="panel-links">' + n.links.map((l) =>
        `<li><a href="${esc(l.url)}"${linkAttrs(l.url)}>${esc(l.label)}</a></li>`).join('') + '</ul>';
    }
    body += `<p><a class="panel-go" href="${esc(n.url)}"${linkAttrs(n.url)}>Open page</a></p>`;
  }

  const up = n.parent ? `<a class="panel-up" href="${hashFor(n.parent)}" data-zoom-out>Zoom out</a>` : '';
  return `<nav class="crumbs" aria-label="Breadcrumbs"><ol>${crumbs}</ol></nav>`
    + `<h2 class="panel-title" tabindex="-1">${esc(n.label)}</h2>`
    + (n.kind === 'site' ? `<p class="panel-host">${esc(new URL(n.url).host)}</p>` : '')
    + body + up;
}

function hostLabel(n) {
  return n.kind === 'site' ? new URL(n.url).host : 'the hub page';
}

function media(n) {
  if (!n.media) {
    return '<div class="media media--placeholder" aria-hidden="true"><span class="mini-orbit"><i></i></span>'
      + '<span>[Paul] screenshot or recording</span></div>';
  }
  const m = n.media;
  if (m.type === 'video') return `<video class="media" src="${esc(m.src)}" controls preload="none"></video>`;
  return `<img class="media" src="${esc(m.src)}" alt="${esc(m.alt || '')}" loading="lazy">`;
}
