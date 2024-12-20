"use client";

import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function PaperPlane() {
  const width = 10;
  const height = 10;
  const lightOffset = 0.5;

  const [colorMap, normalMap, displacementMap] = useTexture([
    "/assets/textures/Paper005/Paper005_1K-JPG_Color.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_NormalGL.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_Displacement.jpg",
  ]);

  [colorMap, normalMap, displacementMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[width, height, 256, 256]} />
        <meshStandardMaterial
          color="#f5e6d3"
          // roughness={1}
          // metalness={0}
          map={colorMap}
          normalMap={normalMap}
          normalScale={[1.5, 1.5]}
          displacementMap={displacementMap}
          displacementScale={0.1}
          displacementBias={-0.05}
        />
      </mesh>

      <rectAreaLight
        position={[0, 0, lightOffset]}
        width={width}
        height={height}
        intensity={1}
        rotation={[0, 0, 0]}
      />
      <OrbitControls />
    </group>
  );
}
