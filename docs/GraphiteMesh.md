# UV Mapping Insight

## Problem

When using `vUv = uv * uvScale`, the texture appeared only in the bottom-left quadrant of the plane geometry.

## Solution

```glsl
vUv = (uv - 0.5) uvScale + 0.5;
```

## Understanding Why

1. **Default UV Coordinates**

   - UVs in a plane geometry range from (0,0) to (1,1)
   - Bottom-left corner is (0,0)
   - Top-right corner is (1,1)

2. **Simple Scaling (`uv * uvScale`)**

   - Scales from the origin (0,0)
   - This stretches the texture outward from bottom-left
   - Results in texture being compressed into one quadrant

3. **Centered Scaling (`(uv - 0.5) * uvScale + 0.5`)**
   - Subtracting 0.5 centers the UV coordinates around (0,0)
   - Scaling happens from this center point
   - Adding 0.5 back moves the coordinates to proper UV space
   - Results in uniform texture distribution across the plane

Think of it like zooming into an image: scaling from a corner (original approach) vs. scaling from the center (fixed approach).
