export const vertexShader = `
  varying vec3 vPos;
  varying vec3 localPos;
  varying vec3 vRayOrigin;
  varying vec3 vRayDir;
  
  void main() {
    vPos = position;
    localPos = position;
    
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vRayOrigin = cameraPosition;
    vRayDir = normalize(worldPosition.xyz - cameraPosition);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;
  precision highp sampler3D;
  
  uniform sampler3D volume;
  uniform float threshold;
  uniform float time;
  uniform float waveAmplitude;
  uniform float waveSpeed;
  uniform float noiseScale;
  uniform float noiseAmplitude;
  uniform vec3 boxSize;
  uniform int steps;
  uniform float stepSize;
  uniform int renderMode;
  
  varying vec3 vPos;
  varying vec3 localPos;
  varying vec3 vRayOrigin;
  varying vec3 vRayDir;

  // Simplex 3D noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  vec2 rayBoxIntersection(vec3 rayOrigin, vec3 rayDir, vec3 boxMin, vec3 boxMax) {
    vec3 invRayDir = 1.0 / rayDir;
    vec3 tMin = (boxMin - rayOrigin) * invRayDir;
    vec3 tMax = (boxMax - rayOrigin) * invRayDir;
    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);
    float tNear = max(max(t1.x, t1.y), t1.z);
    float tFar = min(min(t2.x, t2.y), t2.z);
    return vec2(tNear, tFar);
  }
  
  vec3 sphericalWaveDisplacement(vec3 pos, float time) {
    vec3 center = vec3(0.0);
    float r = length(pos - center);
    
    if (r < 0.01) return vec3(0.0);
    
    float theta = acos((pos.z - center.z) / r);
    float phi = atan(pos.y - center.y, pos.x - center.x);
    
    // Generate two separate noise values for amplitude and speed modulation
    float amplitudeNoise = snoise(vec3(
      pos.x * noiseScale * 0.5 + time * 0.05,
      pos.y * noiseScale * 0.5 + time * 0.07,
      pos.z * noiseScale * 0.5 + time * 0.06
    )) * 0.5 + 0.5; // Remap to [0,1] range
    
    float speedNoise = snoise(vec3(
      pos.x * noiseScale * 0.3 - time * 0.03,
      pos.y * noiseScale * 0.3 - time * 0.04,
      pos.z * noiseScale * 0.3 - time * 0.05
    )) * 0.5 + 0.5; // Remap to [0,1] range
    
    // Use noise to modulate wave properties
    float localAmplitude = waveAmplitude * (1.0 + amplitudeNoise * noiseAmplitude);
    float localSpeed = waveSpeed * (1.0 + speedNoise * noiseAmplitude);
    
    // Create the wave with modulated properties
    float wave = sin(r * 10.0 - time * localSpeed) / max(r, 0.1);
    
    return vec3(
      localAmplitude * cos(phi) * sin(theta) * wave,
      localAmplitude * sin(phi) * sin(theta) * wave,
      localAmplitude * cos(theta) * wave
    );
  }
  
  void main() {
    vec3 boxMin = vec3(-0.5) * boxSize;
    vec3 boxMax = vec3(0.5) * boxSize;
    
    vec3 rayOrigin = vRayOrigin;
    vec3 rayDir = normalize(vRayDir);
    
    vec2 intersection = rayBoxIntersection(rayOrigin, rayDir, boxMin, boxMax);
    
    if (intersection.x > intersection.y) {
      discard;
    }
    
    float rayStart = max(intersection.x, 0.0);
    float rayEnd = intersection.y;
    
    vec3 entryPoint = rayOrigin + rayDir * rayStart;
    
    float maxIntensity = 0.0;
    float avgIntensity = 0.0;
    float avgCount = 0.0;
    vec4 finalColor = vec4(0.0);
    
    for (int i = 0; i < 500; i++) {
      if (i >= steps) break;
      
      float t = rayStart + float(i) * stepSize;
      if (t > rayEnd) break;
      
      vec3 currentPos = rayOrigin + rayDir * t;
      vec3 texCoord = (currentPos - boxMin) / boxSize;
      
      vec3 waveOffset = sphericalWaveDisplacement(texCoord - 0.5, time) * 0.1;
      vec3 samplePos = texCoord + waveOffset;
      
      if (samplePos.x < 0.0 || samplePos.x > 1.0 ||
          samplePos.y < 0.0 || samplePos.y > 1.0 ||
          samplePos.z < 0.0 || samplePos.z > 1.0) {
        continue;
      }
      
      float intensity = texture(volume, samplePos).r;
      
      if (renderMode == 0) {
        maxIntensity = max(maxIntensity, intensity);
      } else if (renderMode == 1) {
        avgIntensity += intensity;
        avgCount += 1.0;
      } else if (renderMode == 2) {
        if (intensity > threshold) {
          finalColor = vec4(vec3(intensity), 1.0);
          break;
        }
      }
    }
    
    if (renderMode == 0) {
      if (maxIntensity < threshold) discard;
      finalColor = vec4(vec3(maxIntensity), 1.0);
    } else if (renderMode == 1) {
      if (avgCount > 0.0) {
        avgIntensity /= avgCount;
        if (avgIntensity < threshold) discard;
        finalColor = vec4(vec3(avgIntensity), avgIntensity);
      } else {
        discard;
      }
    }
    
    gl_FragColor = finalColor;
  }
`;
