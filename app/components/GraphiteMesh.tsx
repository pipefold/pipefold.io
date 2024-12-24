"use client";
import React, { useEffect, useRef } from "react";
import { shaderMaterial, useTexture, OrbitControls } from "@react-three/drei";
import { extend, ThreeElement } from "@react-three/fiber";
import { Color, DoubleSide, ShaderMaterial } from "three";
import { useViewportPlane } from "../hooks/useViewportPlane";
import * as THREE from "three";
import { useControls } from "leva";

// Basic shader material
const GraphiteMaterial = shaderMaterial(
  {
    color: new Color(1.0, 0.0, 0.0),
    paperTexture: null,
    uvScale: 1.0,
    showDebug: true,
    baseRepeats: 5.0,
  },
  // Vertex shader
  /*glsl*/ `
    uniform float uvScale;
    varying vec2 vUv;
    
    void main() {
      vUv = (uv - 0.5) * uvScale + 0.5;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  /*glsl*/ `
    uniform vec3 color;
    uniform sampler2D paperTexture;
    uniform bool showDebug;
    uniform float baseRepeats;
    varying vec2 vUv;

    void main() {
      vec2 repeatedUV = fract(vUv * baseRepeats);
      
      vec4 paper = texture2D(paperTexture, vUv);
      vec3 final = color * paper.rgb;

      if (showDebug) {
        float gridLine = step(0.98, repeatedUV.x) + step(0.98, repeatedUV.y);
        vec3 uvColor = vec3(repeatedUV.x, repeatedUV.y, 0.0);
        final = mix(final, uvColor, 0.5);
        final = mix(final, vec3(1.0), gridLine);
      }
      
      gl_FragColor = vec4(final, 1.0);
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

// Add this type for our custom material
type GraphiteMaterialImpl = ShaderMaterial & {
  uniforms: {
    color: { value: THREE.Color };
    paperTexture: { value: THREE.Texture | null };
    uvScale: { value: number };
    showDebug: { value: boolean };
    baseRepeats: { value: number };
  };
};

const GraphiteMesh = () => {
  const { showDebug, baseRepeats, uvScale } = useControls({
    showDebug: true,
    baseRepeats: { value: 5, min: 1, max: 20 },
    uvScale: { value: 1, min: 0.1, max: 5 },
  });

  // Create a ref to hold the material
  const materialRef = useRef<GraphiteMaterialImpl>(null);

  // Update uniforms when controls change
  useEffect(() => {
    if (materialRef.current) {
      console.log("Updating uniforms");
      materialRef.current.uniforms.showDebug.value = showDebug;
      materialRef.current.uniforms.uvScale.value = uvScale;
      materialRef.current.uniforms.baseRepeats.value = baseRepeats;
    }
  }, [showDebug, uvScale, baseRepeats]);

  const paperTexture = useTexture(
    "/assets/textures/Paper005/Paper005_1K-JPG_Roughness.jpg"
  );
  const { width, height } = useViewportPlane();

  // Handle texture repeat with aspect ratio preservation
  useEffect(() => {
    paperTexture.wrapS = paperTexture.wrapT = THREE.RepeatWrapping;

    // Calculate repeats based on aspect ratio
    const aspectRatio = width / height;
    paperTexture.repeat.set(
      baseRepeats * aspectRatio, // width repeats
      baseRepeats // height repeats
    );
  }, [paperTexture, width, height, baseRepeats]);

  return (
    <>
      <OrbitControls />
      <directionalLight position={[1, 1, 1]} />
      <ambientLight intensity={0.5} />

      <group>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[width, height]} />
          <graphiteMaterial
            ref={materialRef}
            key={GraphiteMaterial.key + baseRepeats + uvScale + showDebug}
            uniforms={{
              color: { value: new Color("#fff") },
              paperTexture: { value: paperTexture },
              uvScale: { value: uvScale },
              showDebug: { value: showDebug },
              baseRepeats: { value: baseRepeats },
            }}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </>
  );
};

export default GraphiteMesh;
