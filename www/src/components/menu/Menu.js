import React from "react";

const Menu = ({
  handlePlay,
  playing,
  nextGeneration,
  tick,
  initial,
  clear,
  reset,
  changeCellSize,
  cellSize,
  changeTickSpeed,
  tickSpeed,
  changeAnimationSpeed,
  animationSpeed,
  cellColorChange,
  cellColor,
  changeUniverseSize,
  handleRowChange,
  handleColChange,
  strokeColorChange,
  strokeColor,
}) => {
  return (
    <>
      <div>
        <button id="play-pause" onClick={handlePlay}>
          {playing ? "pause" : "play"}
        </button>
        <button id="next-generation" onClick={nextGeneration}>
          {(function () {
            let result = "";
            switch (tick) {
              case 1: {
                result = "";
                break;
              }
              case 2: {
                result = "2nd";
                break;
              }
              case 3: {
                result = "3rd";
                break;
              }
              default: {
                result = `${tick}th`;
                break;
              }
            }
            return `next ${result} generation`;
          })()}
        </button>
      </div>
      <div>
        <button id="initial" onClick={initial}>
          random
        </button>
        <button id="clear" onClick={clear}>
          clear
        </button>
        <button id="reset" onClick={reset}>
          reset
        </button>
      </div>
      <div>
        <label htmlFor="cell-size">cell size</label>
        4
        <input
          id="cell-size"
          type="range"
          min="4"
          max="20"
          onChange={changeCellSize}
          defaultValue={cellSize}
        />
        20
      </div>
      <div>
        <label htmlFor="tick-speed">generation skip</label>
        1
        <input
          id="tick-speed"
          type="range"
          min="1"
          max="10"
          onChange={changeTickSpeed}
          defaultValue={tickSpeed}
        />
        10
      </div>
      <div>
        <label htmlFor="animation-speed">animation speed</label>
        1
        <input
          id="animation-speed"
          type="range"
          min="1"
          max="30"
          onChange={changeAnimationSpeed}
          defaultValue={animationSpeed}
        />
        30
      </div>
      <div>
        <input
          type="color"
          id="cell-color"
          onChange={cellColorChange}
          defaultValue={cellColor}
        />
        <label htmlFor="cell-color">cell color</label>
        <br />
        <input
          type="color"
          id="border-color"
          onChange={strokeColorChange}
          defaultValue={strokeColor}
        />
        <label htmlFor="border-color">border color</label>
      </div>
      <div>
        <button id="universe-size" onClick={changeUniverseSize}>
          new universe
        </button>
        <input type="text" size="10" id="row-size" onChange={handleRowChange} />
        <input type="text" size="10" id="col-size" onChange={handleColChange} />
      </div>
    </>
  );
};

export default Menu;
