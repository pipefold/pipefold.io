import { PaperPlane } from "./components/PaperPlane";
import R3F from "./components/R3F";
import styles from "./styles/ink-effects.module.css";

const Page = () => (
  <div className="h-screen w-screen relative">
    <R3F>
      <PaperPlane />
    </R3F>

    <div className="absolute inset-0 flex flex-col items-center justify-center gap-16 font-mono pointer-events-none">
      <h1 className={styles.original}>Hello, Paper World (Original)</h1>

      <h1 className={styles.dramatic}>Hello, Paper World (Dramatic)</h1>

      <h1 className={styles.textured}>Hello, Paper World (Textured)</h1>

      <h1 className={styles.faded}>Hello, Paper World (Faded)</h1>
    </div>
  </div>
);

export default Page;
