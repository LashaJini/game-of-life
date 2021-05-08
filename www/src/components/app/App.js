import React from "react";
import { Main3D, Main } from "../";

const App = () => {
  const [threeD, setThreeD] = React.useState(false);

  const handleClick = () => {
    setThreeD((prev) => !prev);
  };

  return (
    <>
      {threeD ? (
        <>
          <button onClick={handleClick}>2d</button>
          <Main3D />
        </>
      ) : (
        <>
          <button onClick={handleClick}>3d</button>
          <Main />
        </>
      )}
    </>
  );
};

export default App;
