"use client";
import { useTexture } from "@react-three/drei";
import { folder, useControls } from "leva";

const RockComparison = () => {
  // Load all PBR textures for both rocks
  const rockTextures1 = useTexture({
    map: "/assets/textures/Rock029/Rock029_2K-JPG_Color.jpg",
    normalMap: "/assets/textures/Rock029/Rock029_2K-JPG_NormalGL.jpg",
    roughnessMap: "/assets/textures/Rock029/Rock029_2K-JPG_Roughness.jpg",
    aoMap: "/assets/textures/Rock029/Rock029_2K-JPG_AmbientOcclusion.jpg",
    displacementMap: "/assets/textures/Rock029/Rock029_2K-JPG_Displacement.jpg",
  });

  const rockTextures2 = useTexture({
    map: "/assets/textures/Rock035/Rock035_2K-JPG_Color.jpg",
    normalMap: "/assets/textures/Rock035/Rock035_2K-JPG_NormalGL.jpg",
    roughnessMap: "/assets/textures/Rock035/Rock035_2K-JPG_Roughness.jpg",
    aoMap: "/assets/textures/Rock035/Rock035_2K-JPG_AmbientOcclusion.jpg",
    displacementMap: "/assets/textures/Rock035/Rock035_2K-JPG_Displacement.jpg",
  });

  // Create controls for material properties
  const materialProps = useControls({
    materials: folder({
      metalness: { value: 0, min: 0, max: 1 },
      roughness: { value: 1, min: 0, max: 1 },
      clearcoat: { value: 0, min: 0, max: 1 },
      clearcoatRoughness: { value: 0, min: 0, max: 1 },
      normalScale: { value: 1, min: 0, max: 2 },
      displacementScale: { value: 0.1, min: 0, max: 1 },
    }),
  });

  return (
    <>
      {/* Left sphere */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1, 0.5, 16, 100]} />
        <meshPhysicalMaterial {...rockTextures1} {...materialProps} />
      </mesh>

      {/* Right sphere */}
      {/* <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhysicalMaterial {...rockTextures2} {...materialProps} />
      </mesh> */}
    </>
  );
};

export default RockComparison;
