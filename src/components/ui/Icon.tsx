import React from "react";

const Icon = ({ name, className }: { name: string; className?: string }) => {
  return (
    <span
      className={`inline-block bg-no-repeat bg-center dark:invert ${className}`}
      style={{
        backgroundImage: `url(/icons/${name}.svg)`,
        width: "1em",
        height: "1em",
        backgroundSize: "contain",
      }}
    />
  );
};

export default Icon;
