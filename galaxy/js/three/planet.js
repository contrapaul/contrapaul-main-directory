// Planet renderer. Contract: see specs/galaxy-demo.md.
import * as THREE from 'three';
import { rng } from '../random.js';

const TYPE_INT = { rocky: 0, ocean: 1, desert: 2, ice: 3, gas: 4, moon: 5 };

const NOISE = `
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p, int oct) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * noise3(p); p = p * 2.02 + 17.1; a *= 0.5; } return s / (1.0 - pow(0.5, float(oct))); }
`;

function hex(color) { return '#' + color.getHexString(); }

function vary(hexStr, rand, amount) {
  const c = new THREE.Color(hexStr);
  const f = 1 + (rand() - 0.5) * amount;
  c.r = Math.min(1, c.r * f); c.g = Math.min(1, c.g * f); c.b = Math.min(1, c.b * f);
  return hex(c);
}

// Palettes per type, with a small seeded variation. Returns hex strings + strength number.
export function paletteFor(type, hue, seed) {
  const r = rng((seed ^ (hashCode(type) * 7919)) >>> 0);
  let a, b, c = null, atmo = '#6fa8ff', strength = 0.6;
  if (type === 'rocky') { a = '#5b4a3a'; b = '#9a8670'; }
  else if (type === 'ocean') { a = '#1b3a5e'; b = '#4f6b3a'; c = '#8c7b55'; }
  else if (type === 'desert') { a = '#a9744a'; b = '#e2c08d'; atmo = '#ffb27a'; strength = 0.25; }
  else if (type === 'ice') { a = '#a9c0cc'; b = '#eef5f8'; }
  else if (type === 'gas') {
    a = hslHex(hue, 0.35, 0.55); b = hslHex(hue + 30, 0.25, 0.75); c = hslHex(hue - 20, 0.40, 0.40);
    atmo = hslHex(hue, 0.60, 0.70); strength = 0.35;
  } else if (type === 'moon') { a = '#5e5e5e'; b = '#a3a3a3'; }
  else throw new Error(`unknown planet type: ${type}`);
  a = vary(a, r, 0.12); b = vary(b, r, 0.12); if (c) c = vary(c, r, 0.12);
  return { a, b, c, atmo, strength: type === 'moon' ? 0 : strength };
}

function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

function hslHex(h, s, l) {
  return hex(new THREE.Color().setHSL(((h % 360) + 360) % 360 / 360, s, l));
}

const VERT = `
uniform float uR;
varying vec3 vP; varying vec3 vW; varying vec3 vN;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  vP = position / uR;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = `
uniform vec3 uStarPos; uniform float uSeed; uniform int uType; uniform int uOct;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uAtmo; uniform float uAtmoStrength;
varying vec3 vP; varying vec3 vW; varying vec3 vN;
${NOISE}
void main() {
  vec3 N = normalize(vN);
  vec3 L = normalize(uStarPos - vW);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, L);
  float h = fbm(vP * 2.2 + uSeed, uOct);
  vec3 albedo;
  float water = 0.0;
  if (uType == 0) {
    albedo = mix(uA, uB, smoothstep(0.35, 0.7, h));
    albedo = albedo * (0.8 + 0.2 * fbm(vP * 9.0 + uSeed, 3));
  } else if (uType == 1) {
    water = step(h, 0.5);
    vec3 land = mix(uB, uC, smoothstep(0.5, 0.75, h));
    vec3 sea = uA * (0.7 + 0.6 * h);
    albedo = mix(land, sea, water);
    albedo = mix(albedo, vec3(0.9), smoothstep(0.78, 0.9, abs(vP.y) + 0.1 * h));
  } else if (uType == 2) {
    albedo = mix(uA, uB, smoothstep(0.3, 0.7, fbm(vec3(vP.x * 2.0, vP.y * 9.0, vP.z * 2.0) + uSeed, uOct)));
  } else if (uType == 3) {
    albedo = mix(uA, uB, h);
    albedo = albedo * (1.0 - 0.25 * smoothstep(0.48, 0.5, h) * (1.0 - smoothstep(0.5, 0.52, h)));
  } else if (uType == 4) {
    float b = sin(vP.y * 14.0 + 3.0 * fbm(vP * vec3(1.5, 6.0, 1.5) + uSeed, uOct));
    albedo = mix(mix(uA, uB, 0.5 + 0.5 * b), uC, smoothstep(0.6, 0.8, fbm(vP * 4.0 + uSeed, 3)) * 0.5);
  } else {
    albedo = mix(uA, uB, h);
    albedo = albedo * (1.0 - 0.3 * smoothstep(0.66, 0.7, fbm(vP * 6.0 + uSeed, 3)));
  }
  float diff = max(ndl, 0.0);
  vec3 c = albedo * (0.015 + 0.985 * diff);
  if (uType == 1 && water > 0.5) {
    c += 0.35 * pow(max(dot(reflect(-L, N), V), 0.0), 60.0) * smoothstep(0.0, 0.2, ndl);
  }
  if (uType != 5) {
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0) * smoothstep(-0.15, 0.35, ndl);
    c += uAtmo * rim * uAtmoStrength;
  }
  gl_FragColor = vec4(min(c, vec3(0.95)), 1.0);
  #include <colorspace_fragment>
}
`;

const RING_VERT = `
varying float vT; varying vec3 vW; varying vec3 vN;
uniform float uInner; uniform float uOuter;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
  float r = length(position.xy);
  vT = (r - uInner) / (uOuter - uInner);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const RING_FRAG = `
uniform vec3 uA; uniform vec3 uStarPos; uniform float uSeed;
varying float vT; varying vec3 vW; varying vec3 vN;
void main() {
  vec3 L = normalize(uStarPos - vW);
  float lit = 0.2 + 0.8 * abs(dot(normalize(vN), L));
  float alpha = 0.55 * (0.5 + 0.5 * sin(vT * 40.0 + uSeed)) * smoothstep(0.0, 0.08, vT) * (1.0 - smoothstep(0.9, 1.0, vT));
  gl_FragColor = vec4(uA * lit, alpha);
  #include <colorspace_fragment>
}
`;

export function createPlanet({ type, radius, seed, hue = 0, quality }) {
  const isLow = quality === 'low';
  const palette = paletteFor(type, hue, seed);
  const uniforms = {
    uStarPos: { value: new THREE.Vector3() },
    uSeed: { value: (seed % 1000) / 10 },
    uType: { value: TYPE_INT[type] },
    uOct: { value: isLow ? 3 : 5 },
    uR: { value: radius },
    uA: { value: new THREE.Color(palette.a) },
    uB: { value: new THREE.Color(palette.b) },
    uC: { value: new THREE.Color(palette.c || palette.b) },
    uAtmo: { value: new THREE.Color(palette.atmo) },
    uAtmoStrength: { value: palette.strength },
  };
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, isLow ? 32 : 64, isLow ? 16 : 32),
    new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG }),
  );

  const object = new THREE.Group();
  object.add(body);

  let ring = null;
  if (type === 'gas' && seed % 2 === 1) {
    const inner = radius * 1.35, outer = radius * 2.1;
    const ringUniforms = {
      uA: { value: new THREE.Color(palette.a) },
      uStarPos: uniforms.uStarPos,
      uSeed: uniforms.uSeed,
      uInner: { value: inner },
      uOuter: { value: outer },
    };
    // Ring geometry lies in the x-y plane; rotate to x-z then tilt.
    ring = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 96),
      new THREE.ShaderMaterial({
        uniforms: ringUniforms,
        vertexShader: RING_VERT,
        fragmentShader: RING_FRAG,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      }),
    );
    ring.rotation.x = Math.PI / 2 + 0.4; // flat-ish, tilted 0.4 rad
    ring.position.y = 0;
    object.add(ring);
  }

  function update(t, starPos) {
    uniforms.uStarPos.value.copy(starPos);
  }

  return { object, update, ring, body, uniforms };
}
