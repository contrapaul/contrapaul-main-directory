# Galaxy demo: contracts and task cards

Demo of the 3D galaxy landing page at `/galaxy/` on branch `galaxy-demo`.
`index.html` and the card grid stay untouched until Paul accepts the demo.

## Decided (Paul, 2026-11-23)

- Demo first, in its own folder (`/galaxy/`, `noindex`). Roll into the main page only if Paul judges it good enough.
- Real 3D with three.js (0.186.1, vendored in `galaxy/vendor/three-0.186.1/`, import map, no CDN).
- Built by an Inkling swarm on the Spark first; the lead builds it if the results are poor.
- Quality bar: smooth on a mid-range phone at 375x812, smooth navigation, no bloom whiteout, readable labels at every zoom level, keyboard plus Escape and Back working, no requests to other hosts, Paul's eye on a real phone. Paul decides.
- A pull-up conventional site map (`<dialog id="atlas">`) for visitors who do not want to fly.
- Placeholders for media and missing descriptions. Paul drafts the full link list after the demo.

## Lead decisions

- No post-processing (no bloom pass): glow comes from additive camera-facing quads. Cheaper on phones and avoids whiteout.
- No logarithmic depth buffer: `camera.near` and `camera.far` follow the camera distance each frame (`near = dist * 0.01`, `far = dist * 4 + 4000`).
- The renderer outputs sRGB (`outputColorSpace = SRGBColorSpace`), no tone mapping. Shaders work in linear colour. Colours reach shaders as `THREE.Color` uniforms (which three converts from sRGB hex to linear), never as hex literals typed into GLSL. Every fragment shader ends with `#include <colorspace_fragment>` after setting `gl_FragColor`.

## World

- Units: galaxy disk radius 1000 in the x-z plane, y up. Core at the origin.
- `galaxy/js/cosmos.js` (lead, tested): stars on two log-spiral arms, `armAngle(r, arm) = ln(max(r, 100) / 100) / 0.4 + arm * PI`. The disk turns once every `GALAXY.turn` = 1800 s. A point at angle `a` sits at `(r cos a, y, r sin a)`; the disk turning by `g` adds `g` to `a`, which in three.js is `rotation.y = -g`.
- Sizes: star radius 0.6 to 1, planet 0.28 to 0.5, moon 0.1 to 0.14. A system is 10 to 40 units across.
- Camera distances: about 2600 at the galaxy view, 15 to 90 at a system, 1 to 5 at a planet or moon.
- `galaxy/js/view.js` (lead, tested): camera flights. `galaxy/js/main.js` (lead): wiring.

## Module contracts (builders fill these in; the stubs already work)

```js
// galaxy/js/three/galaxy.js
export function createGalaxy({ quality }) // quality: 'high' | 'low'
  -> { object: THREE.Object3D, update(t /* s, galaxy clock */, camera /* PerspectiveCamera */) }

// galaxy/js/three/star.js
export function createStar({ color /* '#rrggbb' */, radius, seed /* int */, quality })
  -> { object: THREE.Object3D, update(t, camera) }

// galaxy/js/three/planet.js
export function createPlanet({ type /* rocky|ocean|desert|ice|gas|moon */, radius, seed, hue /* 0-360 */, quality })
  -> { object: THREE.Object3D, update(t, starPos /* THREE.Vector3, world; copy it, main reuses the object */) }
```

`main.js` sets `object.position` for stars, planets and moons every frame. It never touches their children or materials. The galaxy object stays at the origin.

### Shared GLSL noise (paste as is, do not derive your own)

```glsl
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p, int oct) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * noise3(p); p = p * 2.02 + 17.1; a *= 0.5; } return s / (1.0 - pow(0.5, float(oct))); }
```

`fbm` returns roughly 0 to 1, centred near 0.5.

## Task cards

### `galaxy`: owns `galaxy/js/three/galaxy.js`, `test/galaxy/galaxy.test.mjs`

`object` is a `THREE.Group` holding three children: `disk` (turns), `core` and `sky` (do not turn). `update` sets `disk.rotation.y = -2 * PI * t / GALAXY.turn`, turns `core` to face the camera (`core.quaternion.copy(camera.quaternion)`), puts `sky.position` at `camera.position`, and sets the disk's pixel-ratio uniform.

1. **Disk points.** One `THREE.Points` with attributes `position` (3), `color` (3, linear, from `THREE.Color`), `size` (1). Count: 50000 on `high`, 20000 on `low`. Seeded with `rng(GALAXY.seed + 1)` from `../random.js`; Gaussian `N()` by Box-Muller from that rng. Mix:
   - 15 % bulge: `r = abs(N()) * 110`, angle uniform, `y = N() * 40 * exp(-r / 200)`. Colour between `#ffd9a0` and `#fff1d8`, brightness 0.5 to 0.9. Size 1.5 to 3.
   - 70 % arms: `r = 100 + 900 * sqrt(u)`, `arm = i % 2`, `theta = armAngle(r, arm) + N() * (0.18 + 0.25 * r / 1000)`, `y = N() * (6 + 10 * (1 - r / 1000))`. Colour between `#cfdcff` and `#9db4ff`, brightness 0.35 to 0.8, size 1.5 to 3. 4 % of these are star-forming knots: colour `#ff8fb8`, size 4 to 7, brightness 0.6.
   - 15 % even disk: `r = 1000 * sqrt(u)`, angle uniform, `y = N() * 12`. Colour `#b8b0c8`, brightness 0.2 to 0.4, size 1 to 2.
   Position: `(r cos theta, y, r sin theta)`. Store brightness multiplied into `color`.
2. **Disk shader** (`ShaderMaterial`, `transparent`, `depthWrite: false`, `blending: AdditiveBlending`). Uniforms `uPixelRatio` (renderer pixel ratio, pass `Math.min(devicePixelRatio, 2)`), `uScale = 900`.
   Vertex: `vec4 mv = modelViewMatrix * vec4(position, 1.0); float d = -mv.z; float s = size * uScale / d * uPixelRatio; vAlpha = clamp(s, 0.15, 1.0) * smoothstep(3.0, 30.0, d); gl_PointSize = clamp(s, 1.5, 7.0 * uPixelRatio); vColor = color; gl_Position = projectionMatrix * mv;`
   Fragment: `float r = length(gl_PointCoord - 0.5) * 2.0; float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.7, 1.0, r)); gl_FragColor = vec4(vColor * a * vAlpha, 1.0);` then `#include <colorspace_fragment>`.
   Points closer than 30 units fade out, so the camera can sit inside a system without big dots. Target: at the galaxy view no area of the screen is brighter than about 0.9 (the bulge must not turn into a white blob; if in doubt lower bulge brightness).
3. **Core glow.** `core` is a `Mesh(PlaneGeometry(1, 1))` scaled to 700, additive, `depthWrite: false`, uniform `uColor = #ffe2b0`. Fragment with `vec2 q = vUv - 0.5; float r = length(q) * 2.0;` intensity `0.55 * exp(-r * r * 30.0) + 0.22 * exp(-r * r * 6.0)` times `(1.0 - smoothstep(0.85, 1.0, r))`. Peak at most 0.8.
4. **Sky.** `sky` is a `THREE.Points` of 3000 (`low`: 1500) stars on a sphere of radius 3500 (uniform directions: `y = 2u - 1`, angle `2 PI v`), seeded with `rng(GALAXY.seed + 2)`, `sizeAttenuation` off, size 1 to 2 px, brightness 0.15 to 0.6, white to pale blue. `frustumCulled = false` on the disk and the sky.
5. **Tests** (`test/galaxy/galaxy.test.mjs`): counts per quality, no NaN in any attribute, at least 60 % of arm points within 0.6 rad of `armAngle`, same output for two calls (deterministic), `update` turns `disk` and leaves `core` and `sky` unturned.

### `star`: owns `galaxy/js/three/star.js`, `test/galaxy/star.test.mjs`

`object` is a `THREE.Group` with `body` (the sphere) and `glow` (a camera-facing quad).

1. **Body.** `SphereGeometry(radius, 64, 32)` (`low`: 32, 16). `ShaderMaterial` with uniforms `uColor` (`new THREE.Color(color)`), `uTime`, `uSeed` (`(seed % 1000) / 10`), `uOct` (4, `low`: 2).
   Vertex passes `vN = normal` (object space) and `vView = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz)` and `vNw = normalize(mat3(modelMatrix) * normal)`.
   Fragment: `float mu = clamp(dot(normalize(vNw), normalize(vView)), 0.0, 1.0); float g = fbm(vN * 6.0 + vec3(uSeed) + vec3(0.0, uTime * 0.03, 0.0), uOct); float spots = smoothstep(0.62, 0.7, fbm(vN * 2.5 + uSeed, 3)); vec3 c = uColor * (0.7 + 0.45 * g) * (1.0 - 0.55 * (1.0 - mu)) * (1.0 - 0.35 * spots); c = mix(c, vec3(1.0), 0.3 * mu * mu); gl_FragColor = vec4(min(c, vec3(1.0)), 1.0);` then the colorspace include.
2. **Glow.** `Mesh(PlaneGeometry(1, 1))`, `ShaderMaterial` additive, `transparent`, `depthWrite: false`, `renderOrder = 1`. Uniform `uColor` as above. Fragment: `vec2 q = vUv - 0.5; float r = length(q) * 2.0; float halo = 0.9 * exp(-r * 7.0) + 0.25 * exp(-r * 2.5); float spikes = 0.18 * (exp(-abs(q.x) * 160.0) + exp(-abs(q.y) * 160.0)) * (1.0 - r); float i = (halo + spikes) * (1.0 - smoothstep(0.8, 1.0, r)); gl_FragColor = vec4(uColor * i, 1.0);` then the colorspace include.
3. **Size rule.** Export `glowSize(radius, depth) = Math.max(radius * 10, depth * 0.03)`, so a star stays a visible point of light from the galaxy view (about 30 px at depth 2600) and a wide soft halo up close. In `update(t, camera)`: read the group's world position, `depth = camera.position.distanceTo(it)`, `glow.scale.setScalar(glowSize(radius, depth))`, `glow.quaternion.copy(camera.quaternion)`, `body.material.uniforms.uTime.value = t`. When `depth > radius * 400`, hide `body` (it is under a pixel) and keep the glow.
4. **Tests:** `glowSize` values, group has two meshes, `update` with a fake camera (a real `PerspectiveCamera` placed at a distance) scales and turns the glow, and hides `body` when far.

### `planet`: owns `galaxy/js/three/planet.js`, `test/galaxy/planet.test.mjs`

`object` is a `THREE.Group` with `body`, plus `ring` for some gas giants.

1. **Body.** `SphereGeometry(radius, 64, 32)` (`low`: 32, 16). `ShaderMaterial` uniforms: `uStarPos` (`Vector3`, world; in `update` use `.copy(starPos)`), `uSeed` (`(seed % 1000) / 10`), `uType` (int: rocky 0, ocean 1, desert 2, ice 3, gas 4, moon 5), `uOct` (5, `low`: 3), `uA`, `uB`, `uC` (three `THREE.Color` palette colours, chosen per type in JS), `uAtmo` (`THREE.Color`), `uAtmoStrength` (float).
   Vertex: `vP = position / <radius>` (unit sphere point, pass radius as a uniform `uR`), `vW = (modelMatrix * vec4(position, 1.0)).xyz`, `vN = normalize(mat3(modelMatrix) * normal)`.
   Fragment, in this order:
   - `vec3 N = normalize(vN), L = normalize(uStarPos - vW), V = normalize(cameraPosition - vW); float ndl = dot(N, L); float h = fbm(vP * 2.2 + uSeed, uOct);`
   - Albedo by type:
     - rocky: `mix(uA, uB, smoothstep(0.35, 0.7, h))`, darker patches `* (0.8 + 0.2 * fbm(vP * 9.0 + uSeed, 3))`.
     - ocean: `water = h < 0.5`; land `mix(uB, uC, smoothstep(0.5, 0.75, h))`, water `uA * (0.7 + 0.6 * h)`; polar caps: `mix(albedo, vec3(0.9), smoothstep(0.78, 0.9, abs(vP.y) + 0.1 * h))`.
     - desert: bands `mix(uA, uB, smoothstep(0.3, 0.7, fbm(vec3(vP.x * 2.0, vP.y * 9.0, vP.z * 2.0) + uSeed, uOct)))`.
     - ice: `mix(uA, uB, h)` plus cracks: `* (1.0 - 0.25 * smoothstep(0.48, 0.5, h) * (1.0 - smoothstep(0.5, 0.52, h)))`.
     - gas: `float b = sin(vP.y * 14.0 + 3.0 * fbm(vP * vec3(1.5, 6.0, 1.5) + uSeed, uOct)); albedo = mix(mix(uA, uB, 0.5 + 0.5 * b), uC, smoothstep(0.6, 0.8, fbm(vP * 4.0 + uSeed, 3)) * 0.5);`
     - moon: `mix(uA, uB, h)`, craters: `* (1.0 - 0.3 * smoothstep(0.66, 0.7, fbm(vP * 6.0 + uSeed, 3)))`.
   - Light: `float diff = max(ndl, 0.0); vec3 c = albedo * (0.015 + 0.985 * diff);`
   - Ocean glint (ocean, water only): `c += 0.35 * pow(max(dot(reflect(-L, N), V), 0.0), 60.0) * smoothstep(0.0, 0.2, ndl);`
   - Atmosphere rim (all but moon): `float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(-0.15, 0.35, ndl); c += uAtmo * rim * uAtmoStrength;` with `uAtmoStrength` 0.6 (gas 0.35, desert 0.25).
   - `gl_FragColor = vec4(min(c, vec3(0.95)), 1.0);` then the colorspace include.
   The camera sits outside the planet, 3 to 30 radii away. The star can be on any side; the night side must be near black, not grey.
2. **Palettes** (JS, per type, slight variation from a seeded rng): rocky `#5b4a3a #9a8670 -`, ocean `#1b3a5e #4f6b3a #8c7b55`, desert `#a9744a #e2c08d -`, ice `#a9c0cc #eef5f8 -`, gas from `hue`: `hsl(hue, 35%, 55%)`, `hsl(hue + 30, 25%, 75%)`, `hsl(hue - 20, 40%, 40%)`, moon `#5e5e5e #a3a3a3 -`. Atmosphere: rocky, ocean, ice `#6fa8ff`; desert `#ffb27a`; gas `hsl(hue, 60%, 70%)`. Export `paletteFor(type, hue, seed)` returning `{ a, b, c, atmo, strength }` as hex strings and a number, and test it.
3. **Ring.** For `gas` when `seed % 2 === 1`: `RingGeometry(radius * 1.35, radius * 2.1, 96)`, tilted 0.4 rad about x, `side: DoubleSide`, `transparent`, `depthWrite: false`. Fragment: radial coordinate `t` from 0 (inner) to 1 (outer) (pass it from the vertex shader using the vertex distance from the centre); `alpha = 0.55 * (0.5 + 0.5 * sin(t * 40.0 + uSeed)) * smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.9, 1.0, t))`; colour `uA` lit by `0.2 + 0.8 * max(dot(ringNormalWorld, L), abs(dot(...)))` (rings are lit from both faces). Moons orbit from `radius * 2.6`, so the ring must stay inside `radius * 2.2`.
4. **Tests:** every type builds; `paletteFor` is deterministic and valid hex; `update(t, starPos)` copies the vector (changing the passed vector afterwards does not change the uniform); ring only on odd-seed gas giants and inside `radius * 2.2`.

## Lead after merging

Browser pass at 1280x800 and 375x812 (headless Chromium via playwright when the pane is hidden): whiteout, labels at every zoom level, frame time, draw calls, keyboard, Escape and Back, the site map sheet. Then short bug lists to fixers or direct fixes.
