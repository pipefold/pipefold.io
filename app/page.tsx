import { PaperPlane } from "./components/PaperPlane";
import R3F from "./components/R3F";

const Page = () => (
  <div className="h-screen w-screen">
    <R3F>
      <PaperPlane />
    </R3F>
  </div>
);

export default Page;
