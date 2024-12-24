"use client";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface PaperTextProps {
  text: string;
  position?: [number, number, number];
  color?: string;
  size?: number;
}

const PaperText = ({
  text,
  position = [0, 0, 0.1], // Slightly above paper surface
  color = "#000000",
  size = 0.5,
}: PaperTextProps) => {
  return (
    <Text
      position={position}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      material={
        new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: 0.85,
          roughness: 0.7,
          metalness: 0.0,
          blending: THREE.MultiplyBlending,
        })
      }
    >
      {text}
    </Text>
  );
};

export default PaperText;
