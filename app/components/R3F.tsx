"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const R3F = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      gl={{
        alpha: false,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />

      <OrbitControls />
      {children}
    </Canvas>
  );
};

export default R3F;
