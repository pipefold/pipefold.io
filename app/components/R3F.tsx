"use client";

import { Canvas } from "@react-three/fiber";

const R3F = ({ children }: { children: React.ReactNode }) => {
  return (
    <Canvas
      gl={{
        alpha: false,
      }}
    >
      {children}
    </Canvas>
  );
};

export default R3F;
