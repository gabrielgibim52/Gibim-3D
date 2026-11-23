"use client";

import { useMemo, useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createVaseGeometry, getLayerTexture, vaseRadius, SPIRAL_VASE } from "./geometries";
import { StudioEnvironment, BlobShadow } from "./Studio";

import { heroState, HERO_COLORS } from "./heroState";

const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

function PrintingVase() {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const nozzle = useRef<THREE.Group>(null);
  const edge = useRef<THREE.Mesh>(null);
  const { viewport, gl } = useThree();
  const geometry = useMemo(() => createVaseGeometry({ ...SPIRAL_VASE, heightSegments: 200, radialSegments: 220 }), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 1), []);
  const bump = useMemo(() => getLayerTexture(), []);

  const shadow = useRef<THREE.Group>(null);
  const announced = useRef(false);

  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => geometry.dispose();
  }, [gl, geometry]);

  const H = SPIRAL_VASE.height;
  const narrow = viewport.aspect < 0.9;

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = heroState;
    const scale = narrow ? 0.6 : 1;
    const targetX = narrow ? 0 : s.x;
    // no celular o vaso fica na metade de cima e o texto embaixo
    const targetY = narrow ? s.y + 0.095 : s.y;

    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 4, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY - (H * scale) / 2 - (1 - s.intro) * 0.04, 4, dt);
    g.scale.setScalar(scale);
    if (shadow.current) {
      shadow.current.position.set(g.position.x, g.position.y, 0);
      shadow.current.scale.setScalar(scale);
    }
    if (!announced.current) {
      announced.current = true;
      requestAnimationFrame(() => window.dispatchEvent(new Event("gibim:hero-ready")));
    }

    // rotação do scroll + leve paralaxe do mouse + giro contínuo
    const t = state.clock.elapsedTime;
    g.rotation.y = s.rotation + t * 0.15 + s.pointerX * 0.25;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, s.pointerY * 0.08, 3, dt);

    // corte de impressão: tudo acima de "altura impressa" fica invisível
    const printed = THREE.MathUtils.clamp(s.print, 0, 1);
    const cutLocal = printed * H;
    plane.constant = g.position.y + cutLocal * scale + 0.0001;

    // cor do filamento interpolada
    if (material.current) {
      const idx = THREE.MathUtils.clamp(s.color, 0, HERO_COLORS.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(i0 + 1, HERO_COLORS.length - 1);
      tmpA.set(HERO_COLORS[i0]);
      tmpB.set(HERO_COLORS[i1]);
      tmpA.lerp(tmpB, idx - i0);
      material.current.color.lerp(tmpA, 1 - Math.exp(-8 * dt));
    }

    // bico da impressora percorre a borda que está sendo impressa
    const printing = printed > 0.002 && printed < 0.998;
    if (nozzle.current) {
      nozzle.current.visible = printing;
      const theta = t * 9;
      const r = vaseRadius(SPIRAL_VASE, printed, theta);
      nozzle.current.position.set(Math.cos(theta) * r, cutLocal, Math.sin(theta) * r);
    }
    if (edge.current) {
      edge.current.visible = printing;
      edge.current.position.y = cutLocal;
      const r = SPIRAL_VASE.radius * SPIRAL_VASE.profile(printed);
      edge.current.scale.setScalar(r / 0.05);
    }
  });

  return (
    <>
    <group ref={shadow}>
      <BlobShadow radius={0.14} opacity={0.7} />
    </group>
    <group ref={group}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          ref={material}
          color={HERO_COLORS[0]}
          roughness={0.42}
          metalness={0.12}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          bumpMap={bump}
          bumpScale={0.6}
          side={THREE.DoubleSide}
          clippingPlanes={[plane]}
        />
      </mesh>
      {/* anel brilhante na camada sendo impressa */}
      <mesh ref={edge} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.0007, 8, 128]} />
        <meshBasicMaterial color="#fff59a" toneMapped={false} />
      </mesh>
      {/* bico da impressora */}
      <group ref={nozzle}>
        <mesh position={[0, 0.009, 0]}>
          <coneGeometry args={[0.0045, 0.012, 24]} />
          <meshStandardMaterial color="#d9b25b" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.024, 0]}>
          <boxGeometry args={[0.02, 0.018, 0.02]} />
          <meshStandardMaterial color="#202227" metalness={0.6} roughness={0.4} />
        </mesh>
        <pointLight color="#ef8c21" intensity={0.15} distance={0.15} />
      </group>
    </group>
    </>
  );
}

function PointerTracker() {
  useFrame((state) => {
    heroState.pointerX = THREE.MathUtils.lerp(heroState.pointerX, state.pointer.x, 0.05);
    heroState.pointerY = THREE.MathUtils.lerp(heroState.pointerY, state.pointer.y, 0.05);
  });
  return null;
}

export function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.03, 0.78], fov: 30, near: 0.01, far: 10 }}
      gl={{ antialias: true, alpha: true }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[0.6, 1, 0.6]} intensity={1.3} />
      <Suspense fallback={null}>
        <StudioEnvironment />
        <PrintingVase />
      </Suspense>
      <PointerTracker />
    </Canvas>
  );
}
