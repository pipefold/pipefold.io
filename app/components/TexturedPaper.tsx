"use client";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree, createPortal } from "@react-three/fiber";
import PaperText from "./PaperText";
import { useTexture } from "@react-three/drei";

export function TexturedPaper() {
  const { gl, viewport } = useThree();
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  // 1. Position camera correctly
  const camera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    cam.position.z = 1;
    return cam;
  }, []);

  // 2. Create render target with appropriate size
  const renderTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(2048, 2048, {
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        depthBuffer: true, // Add depth buffer
      }),
    []
  );

  const scene = useMemo(() => new THREE.Scene(), []);

  // 3. Update render effect when text changes
  useEffect(() => {
    // Clear the render target
    gl.setRenderTarget(renderTarget);
    gl.clear();

    // Render text to texture
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  }, [gl, scene, camera, renderTarget]);

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
    <>
      {createPortal(
        <group>
          <ambientLight intensity={1} /> {/* 4. Add lighting */}
          <PaperText
            text="Hello, Paper World"
            position={[0, 0, 0]}
            color="#000000"
            size={0.5}
          />
        </group>,
        scene
      )}
      <mesh>
        <planeGeometry args={[dimensions.width, dimensions.height, 256, 256]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={[1.5, 1.5]}
          displacementMap={displacementMap}
          displacementScale={0.2}
          displacementBias={-0.05}
          alphaMap={renderTarget.texture} // 5. Consider using map instead of alphaMap
          transparent={true}
        />
      </mesh>
    </>
  );
}
