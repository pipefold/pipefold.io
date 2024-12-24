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
      <OrbitControls />
      {children}
    </Canvas>
  );
};

export default R3F;
