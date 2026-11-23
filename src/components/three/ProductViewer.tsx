"use client";

import { Suspense, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import { ProductModel, type ModelConfig } from "./ProductModel";
import { StudioEnvironment, GroundShadow } from "./Studio";

function ScaledModel({
  config,
  scale,
  groupRef,
  spin = 0,
}: {
  config: ModelConfig;
  scale: number;
  groupRef?: RefObject<THREE.Group | null>;
  spin?: number;
}) {
  const inner = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  // transição suave quando o tamanho muda
  useFrame((_, dt) => {
    const g = inner.current;
    if (!g) return;
    const s = THREE.MathUtils.damp(g.scale.x, scale, 8, dt);
    g.scale.setScalar(s);
    if (spinner.current) spinner.current.rotation.y += spin * dt;
  });
  return (
    <group ref={spinner}>
      <group
        ref={(g) => {
          inner.current = g;
          if (groupRef) groupRef.current = g;
        }}
      >
        <ProductModel config={config} />
      </group>
    </group>
  );
}

export function ProductViewer({
  config,
  scale = 1,
  autoRotate = true,
  groupRef,
  interactive = true,
  margin = 1.35,
}: {
  config: ModelConfig;
  scale?: number;
  autoRotate?: boolean;
  groupRef?: RefObject<THREE.Group | null>;
  interactive?: boolean;
  margin?: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.32, 0.22, 0.42], fov: 32, near: 0.005, far: 20 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[0.5, 1, 0.4]} intensity={1.2} />
      {config.model === "luminaria" && config.glow && <pointLight position={[0, 0.08, 0]} intensity={0.6} distance={0.8} color="#ffb46b" />}
      <Suspense fallback={null}>
        <StudioEnvironment />
        <Bounds fit clip margin={margin}>
          <ScaledModel config={config} scale={scale} groupRef={groupRef} spin={interactive ? 0 : autoRotate ? 0.9 : 0.15} />
        </Bounds>
        <GroundShadow />
      </Suspense>
      {interactive && (
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        enablePan={false}
        enableZoom={interactive}
        enableRotate={interactive}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.04}
        enableDamping
      />
      )}
    </Canvas>
  );
}
