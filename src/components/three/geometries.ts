import * as THREE from "three";

/**
 * Geometrias procedurais dos produtos. Tudo em metros, apoiado em y = 0,
 * para que a escala real funcione no modo AR.
 */

export type VaseParams = {
  height: number;
  radius: number;
  /** multiplicador do raio ao longo da altura (t de 0 a 1) */
  profile: (t: number) => number;
  ridges?: number;
  ridgeDepth?: number;
  /** quanto as nervuras giram da base ao topo (radianos) */
  twist?: number;
  /** gira o anel inteiro com a altura (efeito facetado torcido) */
  spin?: number;
  radialSegments?: number;
  heightSegments?: number;
};

export function vaseRadius(p: VaseParams, t: number, theta: number) {
  const base = p.radius * p.profile(t);
  const ridges = p.ridges ?? 0;
  const depth = p.ridgeDepth ?? 0;
  return base * (1 + depth * Math.cos(ridges * theta + (p.twist ?? 0) * t));
}

export function createVaseGeometry(p: VaseParams) {
  const radial = p.radialSegments ?? 160;
  const rings = p.heightSegments ?? 120;
  const cols = radial + 1;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * p.height;
    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const theta = u * Math.PI * 2 + (p.spin ?? 0) * t;
      const r = vaseRadius(p, t, u * Math.PI * 2);
      positions.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
      uvs.push(u, t);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const wall = new THREE.BufferGeometry();
  wall.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  wall.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  wall.setIndex(indices);
  wall.computeVertexNormals();

  // costura: a primeira e a última coluna são o mesmo ponto, então média das normais
  const normals = wall.getAttribute("normal") as THREE.BufferAttribute;
  for (let i = 0; i <= rings; i++) {
    const a = i * cols;
    const b = a + radial;
    const n = new THREE.Vector3(
      normals.getX(a) + normals.getX(b),
      normals.getY(a) + normals.getY(b),
      normals.getZ(a) + normals.getZ(b),
    ).normalize();
    normals.setXYZ(a, n.x, n.y, n.z);
    normals.setXYZ(b, n.x, n.y, n.z);
  }

  // fundo do vaso
  const basePos: number[] = [0, 0, 0];
  const baseUv: number[] = [0.5, 0];
  const baseNormal: number[] = [0, -1, 0];
  const baseIdx: number[] = [];
  for (let j = 0; j <= radial; j++) {
    basePos.push(positions[j * 3], 0, positions[j * 3 + 2]);
    baseUv.push(j / radial, 0);
    baseNormal.push(0, -1, 0);
    if (j < radial) baseIdx.push(0, j + 1, j + 2);
  }
  const offset = positions.length / 3;
  const allPos = [...positions, ...basePos];
  const allUv = [...uvs, ...baseUv];
  const allNormal = [...(normals.array as Float32Array), ...baseNormal];
  const allIdx = [...indices, ...baseIdx.map((i) => i + offset)];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(allUv, 2));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(allNormal, 3));
  geo.setIndex(allIdx);
  wall.dispose();
  return geo;
}

export const SPIRAL_VASE: VaseParams = {
  height: 0.22,
  radius: 0.062,
  profile: (t) => 0.78 + 0.32 * Math.sin(Math.PI * (t * 0.9 + 0.12)) - 0.12 * t * t,
  ridges: 14,
  ridgeDepth: 0.07,
  twist: 2.6,
};

export const FACETED_VASE: VaseParams = {
  height: 0.18,
  radius: 0.065,
  profile: (t) => 0.62 + 0.42 * Math.sin(Math.PI * (t * 0.85 + 0.08)),
  radialSegments: 9,
  heightSegments: 7,
  spin: 0.7,
};

export const WAVE_LAMP: VaseParams = {
  height: 0.26,
  radius: 0.08,
  profile: (t) => 0.55 + 0.5 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 0.08 * (1 - t),
  ridges: 22,
  ridgeDepth: 0.045,
  twist: 5,
  heightSegments: 160,
};

/** Suporte de celular: perfil lateral extrudado. */
export function createStandGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0.11, 0);
  s.lineTo(0.11, 0.006);
  s.lineTo(0.054, 0.006);
  s.lineTo(0.092, 0.116);
  s.lineTo(0.084, 0.12);
  s.lineTo(0.044, 0.012);
  s.lineTo(0.016, 0.012);
  s.lineTo(0.016, 0.026);
  s.lineTo(0.006, 0.026);
  s.lineTo(0, 0.02);
  s.lineTo(0, 0);

  const depth = 0.072;
  const geo = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.0016,
    bevelThickness: 0.0016,
    bevelSegments: 3,
  });
  geo.translate(-0.055, 0.0016, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

function hexShape(radius: number) {
  const s = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (k === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export type HexCell = { x: number; z: number; height: number; geometry: THREE.BufferGeometry; floor: THREE.BufferGeometry };

/** Organizador colmeia: 7 células hexagonais de alturas diferentes. */
export function createHoneycomb(): HexCell[] {
  const R = 0.028;
  const wall = 0.0026;
  const apothem = (R * Math.sqrt(3)) / 2;
  const innerR = R - wall / Math.cos(Math.PI / 6);
  const dist = 2 * apothem - wall / 2;
  const heights = [0.1, 0.07, 0.085, 0.06, 0.075, 0.09, 0.065];

  const centers: [number, number][] = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k / 6) * Math.PI * 2;
    centers.push([Math.cos(a) * dist, Math.sin(a) * dist]);
  }

  return centers.map(([x, z], i) => {
    const shape = hexShape(R);
    shape.holes.push(hexShape(innerR) as unknown as THREE.Path);
    const h = heights[i];
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    const floor = new THREE.ExtrudeGeometry(hexShape(R * 0.999), { depth: 0.003, bevelEnabled: false });
    floor.rotateX(-Math.PI / 2);
    return { x, z, height: h, geometry, floor };
  });
}

let layerTexture: THREE.CanvasTexture | null = null;

/** Textura de relevo que imita as camadas de uma impressão 3D. */
export function getLayerTexture() {
  if (layerTexture) return layerTexture;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < c.height; y++) {
    const v = 0.5 + 0.5 * Math.sin((y / c.height) * Math.PI * 2 * 4);
    const g = Math.round(90 + v * 140);
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(0, y, c.width, 1);
  }
  layerTexture = new THREE.CanvasTexture(c);
  layerTexture.wrapS = layerTexture.wrapT = THREE.RepeatWrapping;
  layerTexture.repeat.set(1, 40);
  return layerTexture;
}
