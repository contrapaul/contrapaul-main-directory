// The hash is the source of truth for the view: '' or '#map' is the root.
export function idFromHash(hash) {
  let s = (hash || '').replace(/^#/, '');
  try { s = decodeURIComponent(s); } catch { return null; }
  s = s.replace(/^\/+|\/+$/g, '').toLowerCase();
  return s === '' || s === 'map' ? 'root' : s;
}

export function hashFor(id) {
  return id === 'root' ? '#map' : `#${id}`;
}

export function parentHash(hash) {
  const id = idFromHash(hash);
  if (!id || id === 'root' || !id.includes('/')) return '#map';
  return hashFor(id.slice(0, id.lastIndexOf('/')));
}
