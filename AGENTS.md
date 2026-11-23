# AGENTS.md: galaxy demo swarm

Rules for AI agents working on the galaxy demo (`/galaxy/`, branch `galaxy-demo` and `swarm/*`).
The contracts and task cards are in `specs/galaxy-demo.md`. Read it first.

- Plain ES modules, no build step. Import three.js only as `import * as THREE from 'three'`.
  No addons, no other packages, nothing loaded from another host (no CDN, fonts, images).
- Test with `npm test` (Node's test runner, `node --test`). Node resolves `three` from
  `node_modules`; the browser uses the vendored copy. Keep pure maths in exported functions
  with tests. You cannot open a browser: reason from the code.
- Edit only the files your task card says you own. Never edit `galaxy/js/main.js`,
  `cosmos.js`, `view.js`, `index.html`, `galaxy.css`, `package.json` or another role's file.
  If you need a change there, write it in `docs/requests/<role>.md` and work around it.
- Commit after each working step: `git add <your files> && git commit -m "<role>: <what>"`.
  Never merge, rebase, push or switch branches.
- No em dash or en dash characters anywhere. Write short, plain comments.
- Shaders: linear colour in, `#include <colorspace_fragment>` at the end of every fragment
  shader, colours passed as `THREE.Color` uniforms, never hex typed into GLSL.
