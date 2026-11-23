"use client";

import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import type { MaterialId, ModelKind } from "@/lib/catalog";
import {
  createVaseGeometry,
  createStandGeometry,
  createHoneycomb,
  getLayerTexture,
  SPIRAL_VASE,
  FACETED_VASE,
  WAVE_LAMP,
} from "./geometries";

export type ModelConfig = {
  model: ModelKind;
  color: string;
  secondaryColor?: string;
  material: MaterialId;
  text?: string;
  glow?: boolean;
};

/** Propriedades de material que imitam cada tipo de filamento. */
export function filamentProps(material: MaterialId, color: string, opts: { layers?: boolean; glow?: boolean } = {}) {
  const bumpMap = opts.layers === false ? null : getLayerTexture();
  const base = {
    color,
    bumpMap,
    bumpScale: 0.6,
    side: THREE.DoubleSide,
    emissive: opts.glow ? new THREE.Color(color).lerp(new THREE.Color("#ff9a40"), 0.6) : new THREE.Color("#000000"),
    emissiveIntensity: opts.glow ? 0.12 : 0,
  };
  switch (material) {
    case "pla-silk":
      return { ...base, roughness: 0.28, metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: new THREE.Color(color) };
    case "petg-translucido":
      return { ...base, roughness: 0.18, metalness: 0, transmission: 0.75, thickness: 0.004, ior: 1.5, clearcoat: 0.3 };
    default:
      return { ...base, roughness: 0.78, metalness: 0, clearcoat: 0 };
  }
}

function Vase({ kind, config }: { kind: "vaso-espiral" | "vaso-facetado" | "luminaria"; config: ModelConfig }) {
  const params = kind === "vaso-espiral" ? SPIRAL_VASE : kind === "vaso-facetado" ? FACETED_VASE : WAVE_LAMP;
  const geometry = useMemo(() => createVaseGeometry(params), [params]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const glow = kind === "luminaria" && config.glow;
  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial {...filamentProps(config.material, config.color, { glow })} flatShading={kind === "vaso-facetado"} />
    </mesh>
  );
}

function Lamp({ config }: { config: ModelConfig }) {
  return (
    <group>
      <Vase kind="luminaria" config={config} />
      {/* base com soquete */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.03, 0.034, 0.012, 48]} />
        <meshStandardMaterial color="#1b1c1f" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* lâmpada */}
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.022, 32, 32]} />
        <meshStandardMaterial
          color="#fff3e0"
          emissive="#ffc27a"
          emissiveIntensity={config.glow ? 1.2 : 0}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function Keychain({ config }: { config: ModelConfig }) {
  const font = useLoader(FontLoader, "/fonts/helvetiker_bold.typeface.json");
  const text = (config.text ?? "").trim() || " ";
  const textGeo = useMemo(() => {
    const g = new TextGeometry(text.toUpperCase(), {
      font,
      size: 0.0105,
      depth: 0.0018,
      curveSegments: 6,
      bevelEnabled: true,
      bevelSize: 0.00025,
      bevelThickness: 0.00025,
      bevelSegments: 2,
    });
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0);
    return g;
  }, [font, text]);
  useEffect(() => () => textGeo.dispose(), [textGeo]);

  textGeo.computeBoundingBox();
  const textWidth = textGeo.boundingBox ? textGeo.boundingBox.max.x - textGeo.boundingBox.min.x : 0.03;
  const width = Math.max(0.04, textWidth + 0.016);
  const height = 0.022;
  const depth = 0.004;

  return (
    <group position={[0, height / 2 + 0.002, 0]}>
      <RoundedBox args={[width, height, depth]} radius={0.0035} smoothness={4} castShadow>
        <meshPhysicalMaterial {...filamentProps(config.material, config.color, { layers: false })} />
      </RoundedBox>
      <mesh geometry={textGeo} position={[0.002, 0, depth / 2 - 0.0002]}>
        <meshPhysicalMaterial {...filamentProps(config.material, config.secondaryColor ?? "#ffffff", { layers: false })} />
      </mesh>
      {/* argola */}
      <mesh position={[-width / 2 - 0.004, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.0065, 0.0012, 16, 48]} />
        <meshStandardMaterial color="#b8bcc4" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Stand({ config }: { config: ModelConfig }) {
  const geometry = useMemo(() => createStandGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial {...filamentProps(config.material, config.color, { layers: false })} />
    </mesh>
  );
}

function Honeycomb({ config }: { config: ModelConfig }) {
  const cells = useMemo(() => createHoneycomb(), []);
  useEffect(
    () => () =>
      cells.forEach((c) => {
        c.geometry.dispose();
        c.floor.dispose();
      }),
    [cells],
  );
  const props = filamentProps(config.material, config.color, { layers: false });
  return (
    <group>
      {cells.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <mesh geometry={c.geometry} castShadow>
            <meshPhysicalMaterial {...props} />
          </mesh>
          <mesh geometry={c.floor}>
            <meshPhysicalMaterial {...props} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ProductModel({ config }: { config: ModelConfig }) {
  switch (config.model) {
    case "vaso-espiral":
    case "vaso-facetado":
      return <Vase kind={config.model} config={config} />;
    case "luminaria":
      return <Lamp config={config} />;
    case "chaveiro":
      return <Keychain config={config} />;
    case "suporte":
      return <Stand config={config} />;
    case "colmeia":
      return <Honeycomb config={config} />;
  }
}
