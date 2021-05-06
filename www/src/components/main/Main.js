import React from "react";
import { isPositiveNumber, getIndex } from "../../utils/helpers";
import { memory } from "game-of-life/game_of_life_bg.wasm";
import { Universe, Cell } from "game-of-life";

const DEAD_COLOR = "#fff";

const Main = () => {
  const canvasRef = React.useRef();
  const ctxRef = React.useRef();
  const [cellSize, setCellSize] = React.useState(8);
  const [strokeColor, setStrokeColor] = React.useState("#eee");
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [cellColor, setCellColor] = React.useState("#000");

  React.useEffect(() => {
    ctxRef.current = canvasRef.current.getContext("2d");
    let canvas = canvasRef.current;
    let ctx = ctxRef.current;

    const animationSpeed = document.querySelector("#animation-speed");
    const borderColor = document.querySelector("#border-color");
    const initial = document.querySelector("#initial");
    const nextGeneration = document.querySelector("#next-generation");
    const newSize = document.querySelector("#universe-size");
    const rowInput = document.querySelector("#row-size");
    const colInput = document.querySelector("#col-size");
    const reset = document.querySelector("#reset");
    const cellRange = document.querySelector("#cell-size");
    const playPause = document.querySelector("#play-pause");
    const clear = document.querySelector("#clear");
    const tickSpeed = document.querySelector("#tick-speed");

    let CELL_SIZE = parseInt(cellRange.value);
    let ALIVE_COLOR = cellColor;
    let STROKE_COLOR = borderColor.value ? borderColor.value : "#eee";
    let TICK = parseInt(tickSpeed.value);
    let ANIMATION_SPEED = parseInt(animationSpeed.value);
    let animationId = null;
    let lastTime = 0;
    let FRAME = 1000 / ANIMATION_SPEED;
    let rows = Math.floor(parseInt(rowInput.value));
    let cols = Math.floor(parseInt(colInput.value));

    const universe = Universe.new(
      isPositiveNumber(rows) ? rows : 32,
      isPositiveNumber(cols) ? cols : 32
    );
    let width = universe.get_width();
    let height = universe.get_height();

    canvas.width = (CELL_SIZE + 1) * width + 1;
    canvas.height = (CELL_SIZE + 1) * height + 1;

    const render = (time) => {
      if (time - lastTime > FRAME) {
        for (let i = 0; i < TICK; i++) {
          universe.tick();
        }
        drawCells({
          universe,
          ctx,
          cellSize: CELL_SIZE,
          deadColor: DEAD_COLOR,
          aliveColor: ALIVE_COLOR,
          width,
          height,
        });
        lastTime = time;
      }
      animationId = requestAnimationFrame(render);
    };

    const draw = () => {
      drawGrid({
        ctx,
        strokeColor: STROKE_COLOR,
        cellSize: CELL_SIZE,
        width,
        height,
      });
      drawCells({
        universe,
        ctx,
        cellSize: CELL_SIZE,
        deadColor: DEAD_COLOR,
        aliveColor: ALIVE_COLOR,
        width,
        height,
      });
    };

    const play = () => {
      playPause.textContent = "pause";

      animationId = requestAnimationFrame(render);
      return true;
    };

    const pause = () => {
      playPause.textContent = "play";

      cancelAnimationFrame(animationId);
      animationId = null;
      return true;
    };

    animationSpeed.addEventListener("change", (event) => {
      ANIMATION_SPEED = parseInt(event.target.value);
      FRAME = 1000 / ANIMATION_SPEED;
    });

    cellRange.addEventListener("change", (event) => {
      CELL_SIZE = parseInt(event.target.value);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = (CELL_SIZE + 1) * width + 1;
      canvas.height = (CELL_SIZE + 1) * height + 1;

      draw();
    });

    newSize.addEventListener("click", (event) => {
      rows = Math.floor(parseInt(rowInput.value));
      cols = Math.floor(parseInt(colInput.value));
      if (isPositiveNumber(rows) && isPositiveNumber(cols)) {
        width = rows;
        height = cols;

        universe.set_width(width);
        universe.set_height(height);
        // we are "emptying" after, because universe must be filled with dead cells.
        universe.empty();

        canvas.width = (CELL_SIZE + 1) * width + 1;
        canvas.height = (CELL_SIZE + 1) * height + 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        draw();
      }
    });

    playPause.addEventListener("click", (event) => {
      animationId ? pause() : play();
    });

    tickSpeed.addEventListener("change", (event) => {
      TICK = parseInt(event.target.value);
    });

    // cellColor.addEventListener("change", (event) => {
    //   ALIVE_COLOR = cellColor.value ? cellColor.value : "#000";
    //   drawCells({
    //     universe,
    //     ctx,
    //     cellSize: CELL_SIZE,
    //     deadColor: DEAD_COLOR,
    //     aliveColor: ALIVE_COLOR,
    //     width,
    //     height,
    //   });
    // });

    borderColor.addEventListener("change", (event) => {
      STROKE_COLOR = borderColor.value ? borderColor.value : "#eee";
      drawGrid({
        ctx,
        strokeColor: STROKE_COLOR,
        cellSize: CELL_SIZE,
        width,
        height,
      });
    });

    canvas.addEventListener("click", (event) => {
      const boundingRect = canvas.getBoundingClientRect();

      const canvasLeft = event.clientX - boundingRect.left;
      const canvasTop = event.clientY - boundingRect.top;

      const row = Math.floor(canvasTop / (CELL_SIZE + 1));
      const col = Math.floor(canvasLeft / (CELL_SIZE + 1));

      universe.toggle_cell(row, col);
      drawCells({
        universe,
        ctx,
        cellSize: CELL_SIZE,
        deadColor: DEAD_COLOR,
        aliveColor: ALIVE_COLOR,
        width,
        height,
      });
    });

    nextGeneration.addEventListener("click", (event) => {
      pause();
      for (let i = 0; i < TICK; i++) {
        universe.tick();
      }
      drawCells({
        universe,
        ctx,
        cellSize: CELL_SIZE,
        deadColor: DEAD_COLOR,
        aliveColor: ALIVE_COLOR,
        width,
        height,
      });
    });

    initial.addEventListener("click", (event) => {
      pause();
      universe.random();
      drawCells({
        universe,
        ctx,
        cellSize: CELL_SIZE,
        deadColor: DEAD_COLOR,
        aliveColor: ALIVE_COLOR,
        width,
        height,
      });
    });

    clear.addEventListener("click", (event) => {
      pause();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      universe.empty();
      draw();
    });

    reset.addEventListener("click", (event) => {
      pause();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      universe.reset();
      draw();
    });

    draw();
  }, [cellColor]);

  const handlePlay = () => {
    // setPlay((prev) => !prev);
  };

  const drawGrid = ({ ctx, strokeColor, cellSize, width, height }) => {
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;

    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (cellSize + 1) + 1, 0);
      ctx.lineTo(i * (cellSize + 1) + 1, (cellSize + 1) * height + 1);
    }

    for (let i = 0; i <= height; i++) {
      ctx.moveTo(0, i * (cellSize + 1) + 1);
      ctx.lineTo((cellSize + 1) * width + 1, i * (cellSize + 1) + 1);
    }

    ctx.stroke();
  };

  const drawCells = ({
    universe,
    ctx,
    cellSize,
    deadColor,
    aliveColor,
    width,
    height,
  }) => {
    const cellsPtr = universe.get_cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    // Alive cells.
    ctx.fillStyle = aliveColor;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Alive) continue;

        ctx.fillRect(
          col * (cellSize + 1) + 2,
          row * (cellSize + 1) + 2,
          cellSize - 1,
          cellSize - 1
        );
      }
    }

    // Dead cells.
    ctx.fillStyle = deadColor;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Dead) continue;

        ctx.fillRect(
          col * (cellSize + 1) + 2,
          row * (cellSize + 1) + 2,
          cellSize - 1,
          cellSize - 1
        );
      }
    }

    ctx.fill();
  };

  const cellColorChange = (event) => {
    setCellColor(event.target.value || "#000");
  };

  console.log("render");
  return (
    <>
      <div>
        <button id="play-pause" onClick={handlePlay}>
          play
        </button>
        <button id="next-generation">next generation</button>
      </div>
      <div>
        <button id="initial">initial</button>
        <button id="clear">clear</button>
        <button id="reset">reset</button>
      </div>
      <div>
        <label htmlFor="cell-size">cell size</label>
        4<input id="cell-size" type="range" min="4" max="20" />
        20
      </div>
      <div>
        <label htmlFor="tick-speed">generation skip</label>
        1<input id="tick-speed" type="range" min="1" max="10" />
        10
      </div>
      <div>
        <label htmlFor="animation-speed">animation speed</label>
        1<input id="animation-speed" type="range" min="1" max="30" />
        30
      </div>
      <div>
        <input
          type="color"
          id="cell-color"
          onChange={cellColorChange}
          value={cellColor}
        />
        <label htmlFor="cell-color">cell color</label>
        <br />
        <input type="color" id="border-color" />
        <label htmlFor="border-color">border color</label>
      </div>
      <div>
        <button id="universe-size">new size</button>
        <input type="text" size="10" id="row-size" />
        <input type="text" size="10" id="col-size" />
      </div>
      <canvas className="scene" ref={canvasRef}></canvas>
    </>
  );
};

export default Main;
