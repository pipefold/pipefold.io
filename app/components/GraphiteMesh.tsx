"use client";
import React from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, ThreeElement } from "@react-three/fiber";
import { Color } from "three";

// Basic shader material
const GraphiteMaterial = shaderMaterial(
  {
    color: new Color(1.0, 0.0, 0.0),
    opacity: 1.0,
  },
  // Vertex shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader using the uniform
  /*glsl*/ `
    uniform vec3 color;
    uniform float opacity;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(color, opacity);
    }
  `
);

// Register the material
extend({ GraphiteMaterial });

// Add types to ThreeElements elements so primitives pick up on it
declare module "@react-three/fiber" {
  interface ThreeElements {
    graphiteMaterial: ThreeElement<typeof GraphiteMaterial>;
  }
}

const GraphiteMesh = () => {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <graphiteMaterial
        transparent
        uniforms={{
          color: { value: new Color("#fff") },
          opacity: { value: 1.0 },
        }}
      />
    </mesh>
  );
};

export default GraphiteMesh;
