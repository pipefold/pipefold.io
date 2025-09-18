import React, { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Html,
  ContactShadows,
} from "@react-three/drei";
import { useVideoTexture } from "@react-three/drei";
import * as THREE from "three";

type FramedHtmlProps = {
  url: string;
  title: string;
  position?: [number, number, number];
  rotationY?: number;
  width?: number; // world units
  aspect?: number; // width / height
};

function FrameMesh({ width, height }: { width: number; height: number }) {
  const frameThickness = 0.06;
  const frameDepth = 0.06;
  const innerWidth = Math.max(0, width - frameThickness);
  const innerHeight = Math.max(0, height - frameThickness);
  const frameColor = new THREE.Color("#2b2b2b");

  return (
    <group>
      {/* Outer frame rectangle */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, frameDepth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Recessed inner area (mat) */}
      <mesh position={[0, 0, frameDepth * 0.5]}>
        <boxGeometry args={[innerWidth, innerHeight, frameDepth * 0.5]} />
        <meshStandardMaterial color={"#e9e7e3"} roughness={1} />
      </mesh>
    </group>
  );
}

function FramedHtml(props: FramedHtmlProps) {
  const {
    url,
    title,
    position = [0, 1.4, 0],
    rotationY = 0,
    width = 1.6,
    aspect = 16 / 9,
  } = props;

  const height = width / aspect;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <FrameMesh width={width} height={height} />
      {/* Place the GIF as DOM so it stays animated */}
      <Html
        transform
        distanceFactor={8}
        position={[0, 0, 0.06]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          style={{
            width: 800,
            height: 800 / aspect,
            boxSizing: "border-box",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <img
            src={url}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            loading="lazy"
          />
        </div>
      </Html>
      {/* Title plaque */}
      <Html
        transform
        distanceFactor={10}
        position={[0, -(height / 2) - 0.2, 0.03]}
      >
        <div
          style={{
            padding: "6px 10px",
            fontFamily: "var(--font-eb-garamond, serif)",
            fontSize: 14,
            background: "rgba(255,255,255,0.9)",
            color: "#111",
            border: "1px solid #ddd",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

function FramedVideo(props: FramedHtmlProps) {
  const {
    url,
    title,
    position = [0, 1.4, 0],
    rotationY = 0,
    width = 1.6,
    aspect = 16 / 9,
  } = props;

  const height = width / aspect;
  const texture = useVideoTexture(url, {
    start: true,
    loop: true,
    muted: true,
    playsInline: true,
    crossOrigin: "anonymous",
  } as any);

  useEffect(() => {
    const video = (texture as any)?.image as HTMLVideoElement | undefined;
    if (!video) return;
    video.muted = true;
    video.loop = true;
    (video as any).playsInline = true;
    const play = () => {
      const p = video.play();
      if (p && typeof (p as any).then === "function")
        (p as any).catch(() => {});
    };
    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });
    return () => {
      try {
        video.pause();
      } catch {}
    };
  }, [texture]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <FrameMesh width={width} height={height} />
      {/* Video plane */}
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[width - 0.08, height - 0.08]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Title plaque */}
      <Html
        transform
        distanceFactor={10}
        position={[0, -(height / 2) - 0.2, 0.03]}
      >
        <div
          style={{
            padding: "6px 10px",
            fontFamily: "var(--font-eb-garamond, serif)",
            fontSize: 14,
            background: "rgba(255,255,255,0.9)",
            color: "#111",
            border: "1px solid #ddd",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

function Room() {
  const roomSize: [number, number, number] = [12, 4, 20];
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize[0], roomSize[2]]} />
        <meshStandardMaterial color={"#efefef"} roughness={1} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, roomSize[1], 0]}>
        <planeGeometry args={[roomSize[0], roomSize[2]]} />
        <meshStandardMaterial color={"#f7f7f7"} roughness={1} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, roomSize[1] / 2, -roomSize[2] / 2]}>
        <planeGeometry args={[roomSize[0], roomSize[1]]} />
        <meshStandardMaterial color={"#fafafa"} />
      </mesh>
      {/* Front wall (behind camera) */}
      <mesh
        rotation={[0, Math.PI, 0]}
        position={[0, roomSize[1] / 2, roomSize[2] / 2]}
      >
        <planeGeometry args={[roomSize[0], roomSize[1]]} />
        <meshStandardMaterial color={"#fafafa"} />
      </mesh>
      {/* Left wall */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-roomSize[0] / 2, roomSize[1] / 2, 0]}
      >
        <planeGeometry args={[roomSize[2], roomSize[1]]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>
      {/* Right wall */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[roomSize[0] / 2, roomSize[1] / 2, 0]}
      >
        <planeGeometry args={[roomSize[2], roomSize[1]]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>
    </group>
  );
}

export default function Gallery3D() {
  const artworks = [
    {
      type: "video" as const,
      url: "/videos/buildx-demo-5x.mp4",
      title: "BuildX Demo (MP4)",
      position: [-1.9, 1.56, -4.1] as [number, number, number],
      rotationY: 0.08,
      width: 1.6,
      aspect: 16 / 9,
    },
    {
      type: "video" as const,
      url: "/videos/atlas-demo-3x.mp4",
      title: "Atlas Demo (MP4, v2)",
      position: [1.9, 1.44, -3.85] as [number, number, number],
      rotationY: -0.08,
      width: 1.6,
      aspect: 16 / 9,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "70vh",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4.8], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#f3f4f6"]} />
        <Suspense fallback={null}>
          <Environment preset="city" resolution={256} />
          <Room />
          {artworks.map((art, i) =>
            art.type === "video" ? (
              <FramedVideo
                key={i}
                url={art.url}
                title={art.title}
                position={art.position}
                rotationY={art.rotationY}
                width={art.width}
                aspect={art.aspect}
              />
            ) : (
              <FramedHtml
                key={i}
                url={art.url}
                title={art.title}
                position={art.position}
                rotationY={art.rotationY}
                width={art.width}
                aspect={art.aspect}
              />
            )
          )}
          <ContactShadows
            position={[0, 0.001, 0]}
            opacity={0.25}
            scale={20}
            blur={2}
            far={5}
          />
        </Suspense>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[0, 3.5, 2]}
          intensity={1.2}
          angle={0.4}
          penumbra={0.8}
          castShadow
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
