"use client";

import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function PaperPlane() {
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
    <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
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
  );
}
