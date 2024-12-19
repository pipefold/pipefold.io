"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function PaperPlane() {
  // Dimensions that will be used for both plane and light
  const width = 10;
  const height = 10;
  const lightOffset = 0.5; // Distance of light from the plane

  const [colorMap, normalMap, roughnessMap] = useTexture([
    "/assets/textures/Paper005/Paper005_1K-JPG_Color.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_NormalGL.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_Roughness.jpg",
  ]);

  [colorMap, normalMap, roughnessMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });

  return (
    <group>
      {/* The paper plane */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#f5e6d3"
          roughness={0.8}
          metalness={0}
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          normalScale={[0.6, 0.6]}
        />
      </mesh>

      {/* Matching light */}
      <rectAreaLight
        position={[0, 0, lightOffset]}
        width={width}
        height={height}
        intensity={1}
        rotation={[0, 0, 0]}
      />

      {/* <OrbitControls /> */}
    </group>
  );
}
