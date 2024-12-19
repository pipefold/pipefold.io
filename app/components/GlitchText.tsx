"use client";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";

const GlitchText = () => {
  const textRef = useRef<Mesh>(null!);

  return (
    <Text
      ref={textRef}
      characters="abcdefghijklmnopqrstuvwxyz0123456789!"
      color="blue"
    >
      GLITCH
    </Text>
  );
};

export default GlitchText;
