import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Html,
  ContactShadows,
  useVideoTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { getThemeColors, oklchToRGB } from "../../lib/colors.js";

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

// Knot component (converted from KnotsAnim.astro)
function KnotMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Starting and target geometries (from KnotsAnim)
  const startGeo = React.useMemo(() => {
    const geo = new THREE.TorusKnotGeometry(1, 0.4, 128, 32, 2, 3);
    const targetGeo = new THREE.TorusKnotGeometry(1, 0.4, 128, 32, 3, 5);
    const targetPositions = targetGeo.getAttribute("position").array;
    geo.setAttribute(
      "targetPosition",
      new THREE.BufferAttribute(targetPositions, 3)
    );
    return geo;
  }, []);

  // Theme color handling
  const updateColor = React.useCallback(() => {
    const colors = getThemeColors();
    const themeColor = oklchToRGB(
      colors.isDarkMode ? colors.background : colors.secondary
    );
    const colorLinear = new THREE.Color()
      .setRGB(themeColor.r, themeColor.g, themeColor.b)
      .convertSRGBToLinear();
    if (materialRef.current) {
      materialRef.current.uniforms.color.value = colorLinear;
    }
  }, []);

  useEffect(() => {
    updateColor();
    const observer = new MutationObserver(() => {
      updateColor();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [updateColor]);

  // Animation (from KnotsAnim)
  let time = 0;
  useFrame((state, delta) => {
    time += delta;
    const mixFactor = Math.abs(Math.sin(time * 0.5));
    if (materialRef.current) {
      materialRef.current.uniforms.mixFactor.value = mixFactor;
    }

    if (!meshRef.current) return;

    // Rotations (copied from KnotsAnim)
    const quaternion = new THREE.Quaternion();
    const slowTime = time * 0.3;
    const fastTime = time * 1.2;

    const ySpeedMultiplier = Math.sin(slowTime) * Math.sin(slowTime * 0.7);
    const yDirection = Math.sign(ySpeedMultiplier);
    const yRotationSpeed = Math.abs(ySpeedMultiplier) * 0.015;
    const yQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yRotationSpeed * yDirection
    );

    const xSpeedMultiplier =
      Math.sin(slowTime * 1.3) * Math.cos(slowTime * 0.5);
    const xDirection = Math.sign(xSpeedMultiplier);
    const xRotationSpeed = Math.abs(xSpeedMultiplier) * 0.008;
    const xQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      xRotationSpeed * xDirection
    );

    const zSpeedMultiplier =
      Math.sin(fastTime * 0.8) * (1 - Math.abs(mixFactor - 0.5) * 2);
    const zDirection = Math.sign(zSpeedMultiplier);
    const zRotationSpeed = Math.abs(zSpeedMultiplier) * 0.006;
    const zQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      zRotationSpeed * zDirection
    );

    quaternion.multiply(yQuat).multiply(xQuat).multiply(zQuat);
    meshRef.current.quaternion.multiply(quaternion);
  });

  return (
    <mesh ref={meshRef} geometry={startGeo} position={[0, 1.5, -6]} scale={0.5}>
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          mixFactor: { value: 0.0 },
          color: { value: new THREE.Color() },
        }}
        vertexShader={`
          attribute vec3 targetPosition;
          uniform float mixFactor;
          void main() {
            vec3 pos = mix(position, targetPosition, mixFactor);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          void main() {
            gl_FragColor = vec4(color, 1.0);
          }
        `}
        wireframe
        transparent
      />
    </mesh>
  );
}

// Camera animator for zoom transition
function CameraAnimator({ isGallery }: { isGallery: boolean }) {
  const { camera } = useThree();
  const initialPos = new THREE.Vector3(0, 1.5, 0.5); // Zoomed into knot
  const galleryPos = new THREE.Vector3(0, 1.8, 4.8); // From Gallery3D
  const tRef = useRef(0);

  useFrame((state, delta) => {
    if (isGallery) {
      tRef.current = Math.min(tRef.current + delta * 0.5, 1); // Animate over ~2 seconds
      camera.position.lerpVectors(initialPos, galleryPos, tRef.current);
    } else {
      tRef.current = 0;
      camera.position.copy(initialPos);
    }
  });

  return null;
}

// Main component
export default function Background3D() {
  const [isGallery, setIsGallery] = React.useState(() =>
    window.location.pathname.includes("/portfolio2")
  );

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

  useEffect(() => {
    const handleNavigate = () => {
      setIsGallery(window.location.pathname.includes("/portfolio2"));
    };

    // Listen for Astro's page load event
    document.addEventListener("astro:page-load", handleNavigate);

    // Also listen for popstate for back/forward navigation
    window.addEventListener("popstate", handleNavigate);

    return () => {
      document.removeEventListener("astro:page-load", handleNavigate);
      window.removeEventListener("popstate", handleNavigate);
    };
  }, []);

  return (
    <Canvas
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: isGallery ? "auto" : "none",
      }}
      className="not-dark:opacity-70"
      shadows
      camera={{ position: [0, 1.5, 0.5], fov: 75 }} // Start zoomed on knot
      dpr={[1, 2]}
    >
      <color attach="background" args={["#f3f4f6"]} />
      <Suspense fallback={null}>
        <KnotMesh />
        {isGallery && (
          <>
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
            <ambientLight intensity={0.5} />
            <spotLight
              position={[0, 3.5, 2]}
              intensity={1.2}
              angle={0.4}
              penumbra={0.8}
              castShadow
            />
          </>
        )}
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={10}
        enabled={isGallery}
      />
      <CameraAnimator isGallery={isGallery} />
    </Canvas>
  );
}
