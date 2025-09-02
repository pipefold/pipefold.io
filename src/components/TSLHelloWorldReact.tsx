"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { color, normalWorld, texture, uv, Fn, vec3 } from "three/tsl";

export default function TSLHelloWorldReact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGPURenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      try {
        // Check for WebGPU support
        if (!("gpu" in navigator)) {
          containerRef.current!.innerHTML =
            '<div class="p-4 text-red-500">WebGPU not supported</div>';
          return;
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
        camera.position.z = 3;

        // Renderer
        const { WebGPURenderer } = await import("three/webgpu");
        const renderer = new WebGPURenderer({ antialias: true });
        renderer.setSize(400, 300);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Clear container and add renderer
        containerRef.current!.innerHTML = "";
        containerRef.current!.appendChild(renderer.domElement);

        // Custom TSL function - desaturate effect
        const desaturateFn = Fn((input) => {
          return vec3(0.299, 0.587, 0.114).dot(input.color.xyz);
        });

        // Create a simple material with normal colors
        const { MeshBasicNodeMaterial } = await import("three/webgpu");
        const material = new MeshBasicNodeMaterial();
        material.colorNode = normalWorld; // Use surface normals as color

        // Create a sphere
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        // Animation loop
        const animate = async () => {
          sphere.rotation.x += 0.005;
          sphere.rotation.y += 0.01;

          await renderer.renderAsync(scene, camera);
          requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error("TSL React setup failed:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div class="p-4 text-red-500">TSL initialization failed</div>';
        }
      }
    };

    init();

    // Cleanup
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-96 border border-gray-300 rounded-lg bg-gray-100">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">TSL Hello World (React)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Basic TSL shader showing normal colors
        </p>
      </div>
      <div ref={containerRef} className="w-full h-72"></div>
    </div>
  );
}
