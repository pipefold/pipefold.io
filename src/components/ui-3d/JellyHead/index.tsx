"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { vertexShader, fragmentShader } from "./shaders";

const DIMENSIONS = {
  width: 256,
  height: 256,
  depth: 109,
};

const params = {
  threshold: 50,
  waveSpeed: 2,
  waveAmplitude: 0.15,
  noiseScale: 1,
  noiseAmplitude: 2,
  steps: 50,
  stepSize: 0.033,
  renderMode: 0, // 0: MIP, 1: Average, 2: Isosurface
  cameraDistance: 0.6,
  cameraHeight: 0,
  autoRotateSpeed: 0.5,
  quality: 0.3,
  cameraModulation: true,
  cameraNoiseSpeed: 0.2,
  cameraNoiseAmount: 0.05,
  rotationNoiseAmount: 0.03,
};

export default function JellyHead() {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, params.cameraHeight, params.cameraDistance);

    // Renderer setup with lower initial pixel ratio for better performance
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2) * params.quality
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    renderer.domElement.style.opacity = "0.15";

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.autoRotateSpeed = params.autoRotateSpeed;

    // Load volume data
    const loader = new THREE.FileLoader();
    loader.setResponseType("arraybuffer");

    loader.load("/textures/3d/head256x256x109.zip", async (data) => {
      try {
        const { unzipSync } = await import(
          "three/examples/jsm/libs/fflate.module.js"
        );
        const zip = unzipSync(new Uint8Array(data as ArrayBuffer));
        const volumeData = new Uint8Array(zip["head256x256x109"].buffer);

        // Create 3D texture
        const volumeTexture = new THREE.Data3DTexture(
          volumeData,
          DIMENSIONS.width,
          DIMENSIONS.height,
          DIMENSIONS.depth
        );
        volumeTexture.format = THREE.RedFormat;
        volumeTexture.type = THREE.UnsignedByteType;
        volumeTexture.minFilter = THREE.LinearFilter;
        volumeTexture.magFilter = THREE.LinearFilter;
        volumeTexture.unpackAlignment = 1;
        volumeTexture.needsUpdate = true;

        // Create geometry and material
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            volume: { value: volumeTexture },
            threshold: { value: params.threshold / 255 },
            time: { value: 0 },
            waveAmplitude: { value: params.waveAmplitude },
            waveSpeed: { value: params.waveSpeed },
            noiseScale: { value: params.noiseScale },
            noiseAmplitude: { value: params.noiseAmplitude },
            boxSize: { value: new THREE.Vector3(1, 1, 1) },
            steps: { value: params.steps },
            stepSize: { value: params.stepSize },
            renderMode: { value: params.renderMode },
          },
          vertexShader,
          fragmentShader,
          side: THREE.BackSide,
          transparent: true,
        });
        materialRef.current = material;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Animation
        const clock = new THREE.Clock();
        let lastFrame = 0;
        const targetFPS = 30;
        const frameInterval = 1 / targetFPS;

        function simplexNoise(x: number, y: number, z: number): number {
          return (
            Math.sin(x * 1.23 + y * 2.34 + z * 3.45) * 0.5 +
            Math.sin(x * 4.56 + y * 5.67 + z * 6.78) * 0.25 +
            Math.sin(x * 7.89 + y * 8.9 + z * 9.01) * 0.125
          );
        }

        function animate() {
          requestAnimationFrame(animate);

          const currentTime = clock.getElapsedTime();
          const delta = currentTime - lastFrame;

          if (delta < frameInterval) return;

          lastFrame = currentTime - (delta % frameInterval);

          material.uniforms.time.value = currentTime;

          if (params.cameraModulation) {
            const time = currentTime * params.cameraNoiseSpeed;
            const baseDistance = params.cameraDistance;
            const baseHeight = params.cameraHeight;

            // Generate noise values with different frequencies
            const noiseX = simplexNoise(time * 0.3, 0, 0);
            const noiseY = simplexNoise(0, time * 0.2, 0);
            const noiseZ = simplexNoise(0, 0, time * 0.25);

            // Additional noise for rotation
            const rotX = simplexNoise(time * 0.15, 0, 0);
            const rotY = simplexNoise(0, time * 0.12, 0);
            const rotZ = simplexNoise(0, 0, time * 0.1);

            // Calculate base position on sphere
            const phi = Math.PI * 0.5; // Keep camera at equator level
            const theta = currentTime * params.autoRotateSpeed * 0.1;

            // Set position maintaining consistent distance
            camera.position.x = baseDistance * Math.sin(phi) * Math.cos(theta);
            camera.position.z = baseDistance * Math.sin(phi) * Math.sin(theta);
            camera.position.y = baseHeight;

            // Add subtle noise to position
            camera.position.x +=
              noiseX * params.cameraNoiseAmount * baseDistance * 0.1;
            camera.position.y +=
              noiseY * params.cameraNoiseAmount * baseDistance * 0.1;
            camera.position.z +=
              noiseZ * params.cameraNoiseAmount * baseDistance * 0.1;

            // Apply subtle rotation modulation
            camera.rotation.x = rotX * params.rotationNoiseAmount;
            camera.rotation.y = rotY * params.rotationNoiseAmount;
            camera.rotation.z = rotZ * params.rotationNoiseAmount;

            // Ensure camera keeps looking at center with slight offset
            const lookAtPoint = new THREE.Vector3(
              rotX * params.rotationNoiseAmount,
              rotY * params.rotationNoiseAmount,
              rotZ * params.rotationNoiseAmount
            );
            camera.lookAt(lookAtPoint);
          }

          controls.update();
          renderer.render(scene, camera);
        }

        animate();
      } catch (error) {
        console.error("Error loading volume data:", error);
      }
    });

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
      }}
    ></div>
  );
}
