import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";

export function useViewportPlane() {
  const { viewport, camera } = useThree();
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const distance = camera.position.z;
      const fov = camera.fov * (Math.PI / 180);
      const height = 2 * Math.tan(fov / 2) * distance;
      const width = height * (viewport.width / viewport.height);
      setDimensions({ width, height });
    } else if (camera instanceof THREE.OrthographicCamera) {
      setDimensions({
        width: viewport.width,
        height: viewport.height,
      });
    }
  }, [camera, viewport]);

  return dimensions;
}
