"use client";

import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";

export function PaperPlane() {
  const { viewport, camera } = useThree();
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    // Calculate dimensions to fill viewport
    if (camera instanceof THREE.PerspectiveCamera) {
      const distance = camera.position.z;
      const fov = camera.fov * (Math.PI / 180);
      const height = 2 * Math.tan(fov / 2) * distance;
      const width = height * (viewport.width / viewport.height);
      setDimensions({ width, height });
    } else if (camera instanceof THREE.OrthographicCamera) {
      // For orthographic camera, use the viewport directly
      setDimensions({
        width: viewport.width,
        height: viewport.height,
      });
    }
  }, [camera, viewport]);

  const lightOffset = 0.5;

  const [colorMap, normalMap, displacementMap] = useTexture([
    "/assets/textures/Paper005/Paper005_1K-JPG_Color.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_NormalGL.jpg",
    "/assets/textures/Paper005/Paper005_1K-JPG_Displacement.jpg",
  ]);

  [colorMap, normalMap, displacementMap].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // Adjust texture repeat to maintain aspect ratio
    texture.repeat.set(dimensions.width / 5, dimensions.height / 5);
  });

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[dimensions.width, dimensions.height, 256, 256]} />
        <meshStandardMaterial
          color="#ffffff"
          map={colorMap}
          normalMap={normalMap}
          normalScale={[1.5, 1.5]}
          displacementMap={displacementMap}
          displacementScale={0.2}
          displacementBias={-0.05}
        />
      </mesh>

      <rectAreaLight
        position={[0, 0, lightOffset]}
        width={dimensions.width}
        height={dimensions.height}
        intensity={1}
        rotation={[0, 0, 0]}
      />
      {/* <OrbitControls /> */}
    </group>
  );
}
