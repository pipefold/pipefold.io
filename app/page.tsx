"use client";
import { Leva } from "leva";
import GraphiteMesh from "./components/GraphiteMesh";
import R3F from "./components/R3F";
import RockComparison from "./components/RockComparison";

const Page = () => (
  <div className="h-screen w-screen relative">
    <R3F>
      {/* <TexturedPaper /> */}
      {/* <PaperPlane /> */}
      {/* <GraphiteMesh /> */}
      <RockComparison />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.5}
        lookAt={[0, 0, 0]}
      />
    </R3F>
    <Leva />
  </div>
);

export default Page;
