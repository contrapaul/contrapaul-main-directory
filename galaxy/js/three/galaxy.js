// Galaxy renderer: disk of points, core glow, distant sky. Contract: specs/galaxy-demo.md.
import * as THREE from 'three';
import { GALAXY, armAngle } from '../cosmos.js';
import { rng } from '../random.js';

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// Box-Muller Gaussian from a uniform rng.
function gauss(rand) {
  return () => {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  };
}

export function createGalaxy({ quality = 'high' } = {}) {
  const low = quality === 'low';
  const count = low ? 20000 : 50000;
  const rand = rng(GALAXY.seed + 1);
  const N = gauss(rand);

  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);

  const bulgeLo = new THREE.Color('#ffd9a0'), bulgeHi = new THREE.Color('#fff1d8');
  const armLo = new THREE.Color('#cfdcff'), armHi = new THREE.Color('#9db4ff');
  const knot = new THREE.Color('#ff8fb8');
  const even = new THREE.Color('#b8b0c8');
  const tmp = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const u = rand();
    let r, theta, y, lo, hi, bright, s;
    if (u < 0.15) {
      // bulge
      r = Math.abs(N()) * 110;
      theta = rand() * TAU;
      y = N() * 40 * Math.exp(-r / 200);
      lo = bulgeLo; hi = bulgeHi; bright = 0.5 + rand() * 0.4; s = 1.5 + rand() * 1.5;
    } else if (u < 0.85) {
      // arms
      r = 100 + 900 * Math.sqrt(rand());
      const arm = i % 2;
      theta = armAngle(r, arm) + N() * (0.12 + 0.12 * r / 1000); // lead: thinner, so arms read
      y = N() * (6 + 10 * (1 - r / 1000));
      lo = armLo; hi = armHi; bright = 0.35 + rand() * 0.45; s = 1.5 + rand() * 1.5;
    } else {
      // even disk
      r = 1000 * Math.sqrt(rand());
      theta = rand() * TAU;
      y = N() * 12;
      lo = even; hi = even; bright = 0.2 + rand() * 0.2; s = 1 + rand();
    }
    let isKnot = false;
    if (u >= 0.15 && u < 0.85 && rand() < 0.04) { isKnot = true; }

    tmp.copy(isKnot ? knot : lo).lerp(isKnot ? knot : hi, rand());
    if (isKnot) { bright = 0.6; s = 4 + rand() * 3; }

    pos[i * 3] = r * Math.cos(theta);
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = r * Math.sin(theta);
    col[i * 3] = tmp.r * bright;
    col[i * 3 + 1] = tmp.g * bright;
    col[i * 3 + 2] = tmp.b * bright;
    size[i] = s;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));

  const uniforms = {
    uPixelRatio: { value: 1 },
    uScale: { value: 900 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexColors: true,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float size;
      uniform float uPixelRatio;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float d = -mv.z;
        float s = size * uScale / d * uPixelRatio;
        vAlpha = clamp(s, 0.15, 1.0) * smoothstep(3.0, 30.0, d);
        gl_PointSize = clamp(s, 1.5, 7.0 * uPixelRatio);
        vColor = color;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.7, 1.0, r));
        gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
        // Additive: no sRGB conversion, it would lift the faint tails into a flat haze.
      }
    `,
  });
  const disk = new THREE.Points(geo, mat);
  disk.frustumCulled = false;

  // Core glow quad.
  const coreUniforms = { uColor: { value: new THREE.Color('#ffe2b0') } };
  const core = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: coreUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          vec2 q = vUv - 0.5;
          float r = length(q) * 2.0;
          // lead: a brighter, wider bulge glow (Paul asked for much more glow).
          float intensity = 0.7 * exp(-r * r * 60.0) + 0.32 * exp(-r * r * 12.0) + 0.12 * exp(-r * r * 3.0);
          intensity *= 1.0 - smoothstep(0.85, 1.0, r);
          intensity = min(intensity, 1.0);
          gl_FragColor = vec4(uColor * intensity, 1.0);
          // Additive: no sRGB conversion (see the disk shader).
        }
      `,
    }),
  );
  core.scale.setScalar(1150);

  // Sky points on a sphere.
  const skyCount = low ? 3500 : 7000;
  const skyRand = rng(GALAXY.seed + 2);
  const skyPos = new Float32Array(skyCount * 3);
  const skyCol = new Float32Array(skyCount * 3);
  const skySize = new Float32Array(skyCount);
  const skyWhite = new THREE.Color('#ffffff'), skyBlue = new THREE.Color('#c9d8ff'), skyWarm = new THREE.Color('#ffe2c0');
  for (let i = 0; i < skyCount; i++) {
    const y = 2 * skyRand() - 1;
    const a = skyRand() * TAU;
    const r = Math.sqrt(1 - y * y);
    skyPos[i * 3] = r * Math.cos(a) * 3500;
    skyPos[i * 3 + 1] = y * 3500;
    skyPos[i * 3 + 2] = r * Math.sin(a) * 3500;
    // lead: power law, many faint and a few bright, white, blue or warm.
    const u = skyRand();
    const bright = 0.12 + 0.85 * u ** 5;
    tmp.copy(skyWhite).lerp(skyRand() < 0.7 ? skyBlue : skyWarm, skyRand());
    skyCol[i * 3] = tmp.r * bright; skyCol[i * 3 + 1] = tmp.g * bright; skyCol[i * 3 + 2] = tmp.b * bright;
    skySize[i] = 1.2 + 2.6 * u ** 6 + skyRand() * 0.6;
  }
  const skyGeo = new THREE.BufferGeometry();
  skyGeo.setAttribute('position', new THREE.BufferAttribute(skyPos, 3));
  skyGeo.setAttribute('color', new THREE.BufferAttribute(skyCol, 3));
  skyGeo.setAttribute('size', new THREE.BufferAttribute(skySize, 1));
  const skyMat = new THREE.ShaderMaterial({
    vertexColors: true,
    uniforms: { uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float size;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = color;
        gl_PointSize = size * uPixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.7, 1.0, r));
        gl_FragColor = vec4(vColor * a, 1.0);
        // Additive: no sRGB conversion (see the disk shader).
      }
    `,
  });
  const sky = new THREE.Points(skyGeo, skyMat);
  sky.frustumCulled = false;

  // lead: soft glow clouds along the arms and bulge, so the galaxy glows like a photograph.
  const hazeCount = low ? 700 : 1400;
  const hRand = rng(GALAXY.seed + 3);
  const hPos = new Float32Array(hazeCount * 3), hCol = new Float32Array(hazeCount * 3), hSize = new Float32Array(hazeCount);
  const hazeArm = new THREE.Color('#a8b8ff'), hazePink = new THREE.Color('#ff6fa8'), hazeWarm = new THREE.Color('#ffcf8a');
  const hN = () => Math.sqrt(-2 * Math.log(1 - hRand())) * Math.cos(TAU * hRand());
  for (let i = 0; i < hazeCount; i++) {
    let r, th, c, b, sz;
    if (i % 5 === 0) { r = Math.abs(hN()) * 170; th = hRand() * TAU; c = hazeWarm; b = 0.06; sz = 70 + hRand() * 60; }
    else {
      r = 120 + 880 * Math.sqrt(hRand());
      th = armAngle(r, i % 2) + hN() * (0.08 + 0.1 * r / 1000);
      const pink = hRand() < 0.12;
      c = pink ? hazePink : hazeArm; b = pink ? 0.05 : 0.028 + 0.024 * (1 - r / 1000); sz = pink ? 25 + hRand() * 25 : 45 + hRand() * 50;
    }
    hPos.set([r * Math.cos(th), hN() * 8, r * Math.sin(th)], i * 3);
    hCol.set([c.r * b, c.g * b, c.b * b], i * 3);
    hSize[i] = sz;
  }
  const hGeo = new THREE.BufferGeometry();
  hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
  hGeo.setAttribute('color', new THREE.BufferAttribute(hCol, 3));
  hGeo.setAttribute('size', new THREE.BufferAttribute(hSize, 1));
  const hazeMat = new THREE.ShaderMaterial({
    vertexColors: true,
    uniforms: { uScale: { value: 2200 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float size;
      uniform float uScale;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float d = -mv.z;
        gl_PointSize = clamp(size * uScale / d, 2.0, 320.0);
        vAlpha = smoothstep(80.0, 400.0, d); // fade out when the camera is inside the cloud
        vColor = color;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = exp(-r * r * 3.0) * (1.0 - smoothstep(0.6, 1.0, r));
        gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
      }
    `,
  });
  const haze = new THREE.Points(hGeo, hazeMat);
  haze.frustumCulled = false;
  disk.add(haze);

  const group = new THREE.Group();
  group.add(disk, core, sky);

  const update = (t, camera) => {
    disk.rotation.y = TAU * t / GALAXY.turn; // counter-clockwise from above, arms trailing
    core.quaternion.copy(camera.quaternion);
    sky.position.copy(camera.position);
    const pr = Math.min(typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1, 2);
    uniforms.uPixelRatio.value = pr;
    skyMat.uniforms.uPixelRatio.value = pr;
  };

  return { object: group, update };
}
