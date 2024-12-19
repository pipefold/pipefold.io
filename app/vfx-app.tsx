"use client";
import { useRef } from "react";
import { VFXProvider, VFXSpan } from "react-vfx";

const blink = `
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform sampler2D src;
// uniform vec2 changingValue; // ADD THIS LINE

void main() {
    vec2 uv = (gl_FragCoord.xy - offset) / resolution;
    gl_FragColor = texture2D(src, uv) * step(.5, fract(time));
}
`;

const VFXApp = () => {
  const x = useRef(10);

  return (
    <>
      <VFXProvider>
        <VFXSpan
          shader={blink}
          uniforms={{
            changingValue: () => [x.current, x.current], //  VEC2
          }}
        >
          I'm blinking!
        </VFXSpan>
      </VFXProvider>
      <button
        type="button"
        onClick={() => {
          x.current *= -1;
        }}
      >
        CLICK
      </button>
    </>
  );
};

export default VFXApp;
