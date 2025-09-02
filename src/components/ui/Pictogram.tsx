import React from "react";

const Pictogram = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  return (
    <div
      className={`inline-block mr-2 translate-y-3 bg-no-repeat bg-center dark:invert ${className}`}
      style={{
        backgroundImage: `url(/pictograms/${name}.svg)`,
        width: "1.5em",
        height: "1.5em",
        backgroundSize: "contain",
      }}
    />
  );
};

export default Pictogram;
