// Star builder. Contract: specs/galaxy-demo.md (star card).
import * as THREE from 'three';

const NOISE = `
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p, int oct) { float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * noise3(p); p = p * 2.02 + 17.1; a *= 0.5; } return s / (1.0 - pow(0.5, float(oct))); }
`;

export function glowSize(radius, depth) {
  return Math.max(radius * 12, depth * 0.045);
}

export function createStar({ color, radius, seed, quality }) {
  const low = quality === 'low';
  const object = new THREE.Group();

  const bodyMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uSeed: { value: (seed % 1000) / 10 },
      uOct: { value: low ? 2 : 4 },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vView; varying vec3 vNw;
      void main() {
        vN = normal;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vView = normalize(cameraPosition - wp.xyz);
        vNw = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor; uniform float uTime; uniform float uSeed; uniform int uOct;
      varying vec3 vN; varying vec3 vView; varying vec3 vNw;
      ${NOISE}
      void main() {
        float mu = clamp(dot(normalize(vNw), normalize(vView)), 0.0, 1.0);
        float g = fbm(vN * 6.0 + vec3(uSeed) + vec3(0.0, uTime * 0.03, 0.0), uOct);
        float spots = smoothstep(0.62, 0.7, fbm(vN * 2.5 + uSeed, 3));
        vec3 c = uColor * (0.7 + 0.45 * g) * (1.0 - 0.55 * (1.0 - mu)) * (1.0 - 0.35 * spots);
        c = mix(c, vec3(1.0), 0.3 * mu * mu);
        gl_FragColor = vec4(min(c, vec3(1.0)), 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(radius, low ? 32 : 64, low ? 16 : 32),
    bodyMat,
  );

  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
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
        float halo = 1.1 * exp(-r * 6.0) + 0.35 * exp(-r * 2.2); // lead: more glow
        float spikes = 0.18 * (exp(-abs(q.x) * 160.0) + exp(-abs(q.y) * 160.0)) * (1.0 - r);
        float i = (halo + spikes) * (1.0 - smoothstep(0.8, 1.0, r));
        gl_FragColor = vec4(uColor * i, 1.0);
        // Additive: no sRGB conversion, it would turn the faint halo into a flat grey disc.
      }
    `,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), glowMat);
  glow.renderOrder = 1;

  object.add(body, glow);

  const world = new THREE.Vector3();

  function update(t, camera) {
    object.getWorldPosition(world);
    const depth = camera.position.distanceTo(world);
    glow.scale.setScalar(glowSize(radius, depth));
    glow.quaternion.copy(camera.quaternion);
    bodyMat.uniforms.uTime.value = t;
    body.visible = depth <= radius * 400;
  }

  return { object, update };
}
