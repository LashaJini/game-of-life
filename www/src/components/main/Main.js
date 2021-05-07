import React from "react";
import { isPositiveNumber, getIndex } from "../../utils/helpers";
import { memory } from "game-of-life/game_of_life_bg.wasm";
import { Universe, Cell } from "game-of-life";

const DEAD_COLOR = "#fff";

const Main = () => {
  const canvasRef = React.useRef();
  const ctxRef = React.useRef();

  const cellColor = React.useRef("#000");
  const strokeColor = React.useRef("#eee");
  const [rowInput, setRowInput] = React.useState(null);
  const [colInput, setColInput] = React.useState(null);
  const [tick, setTick] = React.useState(1);
  const tickSpeed = React.useRef(1);
  const cellSize = React.useRef(8);
  const animationSpeed = React.useRef(1);
  const frame = React.useRef(1000);
  const [playing, setPlaying] = React.useState(false);
  const universe = React.useRef();
  const animationId = React.useRef();
  const lastTime = React.useRef(0);

  React.useEffect(() => {
    universe.current = Universe.new(
      isPositiveNumber(rowInput) ? rowInput : 32,
      isPositiveNumber(colInput) ? colInput : 32
    );
  }, []);

  React.useEffect(() => {
    ctxRef.current = canvasRef.current.getContext("2d");
    let width = universe.current.get_width();
    let height = universe.current.get_height();

    canvasRef.current.width = (cellSize.current + 1) * width + 1;
    canvasRef.current.height = (cellSize.current + 1) * height + 1;
    draw();
  }, []);

  const handlePlay = (event, pause) => {
    setPlaying(() => {
      if (!animationId.current && !pause) {
        animationId.current = requestAnimationFrame(render);
        return true;
      }

      cancelAnimationFrame(animationId.current);
      animationId.current = null;
      return false;
    });
  };

  const drawGrid = () => {
    let width = universe.current.get_width();
    let height = universe.current.get_height();
    ctxRef.current.beginPath();
    ctxRef.current.strokeStyle = strokeColor.current;

    for (let i = 0; i <= width; i++) {
      ctxRef.current.moveTo(i * (cellSize.current + 1) + 1, 0);
      ctxRef.current.lineTo(
        i * (cellSize.current + 1) + 1,
        (cellSize.current + 1) * height + 1
      );
    }

    for (let i = 0; i <= height; i++) {
      ctxRef.current.moveTo(0, i * (cellSize.current + 1) + 1);
      ctxRef.current.lineTo(
        (cellSize.current + 1) * width + 1,
        i * (cellSize.current + 1) + 1
      );
    }

    ctxRef.current.stroke();
  };

  const drawCells = () => {
    let width = universe.current.get_width();
    let height = universe.current.get_height();
    const cellsPtr = universe.current.get_cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctxRef.current.beginPath();

    // Alive cells.
    ctxRef.current.fillStyle = cellColor.current;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Alive) continue;

        ctxRef.current.fillRect(
          col * (cellSize.current + 1) + 2,
          row * (cellSize.current + 1) + 2,
          cellSize.current - 1,
          cellSize.current - 1
        );
      }
    }

    // Dead cells.
    ctxRef.current.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Dead) continue;

        ctxRef.current.fillRect(
          col * (cellSize.current + 1) + 2,
          row * (cellSize.current + 1) + 2,
          cellSize.current - 1,
          cellSize.current - 1
        );
      }
    }

    ctxRef.current.fill();
  };

  const cellColorChange = (event) => {
    cellColor.current = event.target.value || "#000";
    drawCells();
  };

  const strokeColorChange = (event) => {
    strokeColor.current = event.target.value || "#eee";
    drawGrid();
  };

  const handleRowChange = (event) => {
    setRowInput(Math.floor(parseInt(event.target.value)));
  };
  const handleColChange = (event) => {
    setColInput(Math.floor(parseInt(event.target.value)));
  };

  const changeUniverseSize = () => {
    if (isPositiveNumber(rowInput) && isPositiveNumber(colInput)) {
      let width = rowInput;
      let height = colInput;

      universe.current.set_width(width);
      universe.current.set_height(height);
      // we are "emptying" after, because universe must be filled with dead cells.
      universe.current.empty();

      canvasRef.current.width = (cellSize.current + 1) * width + 1;
      canvasRef.current.height = (cellSize.current + 1) * height + 1;
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      draw();
    }
  };

  const draw = () => {
    drawGrid();
    drawCells();
  };

  const changeTickSpeed = (event) => {
    tickSpeed.current = parseInt(event.target.value);
    setTick(tickSpeed.current);
  };

  const changeCellSize = (event) => {
    let newCellSize = parseInt(event.target.value);
    // setCellSize(newCellSize);
    cellSize.current = newCellSize;
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    canvasRef.current.width =
      (newCellSize + 1) * universe.current.get_width() + 1;
    canvasRef.current.height =
      (newCellSize + 1) * universe.current.get_height() + 1;
    draw();
  };

  const changeAnimationSpeed = (event) => {
    let tmp = parseInt(event.target.value);
    animationSpeed.current = tmp;
    frame.current = 1000 / tmp;
  };

  const render = (time) => {
    if (time - lastTime.current > frame.current) {
      for (let i = 0; i < tickSpeed.current; i++) {
        universe.current.tick();
      }
      drawCells();
      lastTime.current = time;
    }
    animationId.current = requestAnimationFrame(render);
  };

  const nextGeneration = (event) => {
    handlePlay(null, true);
    for (let i = 0; i < tickSpeed.current; i++) {
      universe.current.tick();
    }
    drawCells();
  };

  const initial = () => {
    handlePlay(null, true);
    universe.current.random();
    drawCells();
  };

  const clear = () => {
    handlePlay(null, true);
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    universe.current.empty();
    draw();
  };

  const reset = () => {
    handlePlay(null, true);
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    universe.current.reset();
    draw();
  };

  const toggleCell = (event) => {
    const boundingRect = canvasRef.current.getBoundingClientRect();

    const canvasLeft = event.clientX - boundingRect.left;
    const canvasTop = event.clientY - boundingRect.top;

    const row = Math.floor(canvasTop / (cellSize.current + 1));
    const col = Math.floor(canvasLeft / (cellSize.current + 1));

    universe.current.toggle_cell(row, col);
    drawCells();
  };

  console.log("render");
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
          defaultValue={cellSize.current}
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
          defaultValue={tickSpeed.current}
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
          defaultValue={animationSpeed.current}
        />
        30
      </div>
      <div>
        <input
          type="color"
          id="cell-color"
          onChange={cellColorChange}
          defaultValue={cellColor.current}
        />
        <label htmlFor="cell-color">cell color</label>
        <br />
        <input
          type="color"
          id="border-color"
          onChange={strokeColorChange}
          defaultValue={strokeColor.current}
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
      <canvas className="scene" ref={canvasRef} onClick={toggleCell}></canvas>
    </>
  );
};

export default Main;
