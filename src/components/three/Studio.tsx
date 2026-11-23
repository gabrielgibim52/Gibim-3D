"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";

/** Iluminação de estúdio gerada localmente (sem baixar HDRs externos). */
export function StudioEnvironment({ accent = "#ff5a1f" }: { accent?: string }) {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.2} position={[0, 4, -2]} scale={[8, 4, 1]} />
      <Lightformer intensity={1.4} position={[-4, 1, 1]} scale={[6, 2, 1]} />
      <Lightformer intensity={1.4} position={[4, 1, 1]} scale={[6, 2, 1]} />
      <Lightformer intensity={0.8} position={[0, 1, 5]} scale={[6, 3, 1]} />
      <Lightformer form="ring" color={accent} intensity={2.5} position={[3, 3, 3]} scale={1.6} />
      <Lightformer form="ring" color="#6aa8ff" intensity={1.2} position={[-3, 2, -3]} scale={1.2} />
    </Environment>
  );
}

export function GroundShadow({ scale = 0.6, opacity = 0.55 }: { scale?: number; opacity?: number }) {
  return <ContactShadows position={[0, 0, 0]} scale={scale} far={0.4} blur={2.4} opacity={opacity} resolution={512} color="#000000" />;
}

/** Sombra suave e barata (gradiente radial), para cenas que se movem. */
export function BlobShadow({ radius = 0.12, opacity = 0.65 }: { radius?: number; opacity?: number }) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.45, "rgba(0,0,0,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0]} renderOrder={-1}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
