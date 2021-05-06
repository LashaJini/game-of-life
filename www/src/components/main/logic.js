import { isPositiveNumber, getIndex } from "../../utils/helpers";
import { memory } from "game-of-life/game_of_life_bg.wasm";
import { Universe, Cell } from "game-of-life";

const render = () => {
  const canvas = document.querySelector(".scene");
  const animationSpeed = document.querySelector("#animation-speed");
  const borderColor = document.querySelector("#border-color");
  const cellColor = document.querySelector("#cell-color");
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
  let ALIVE_COLOR = cellColor.value ? cellColor.value : "#000";
  let DEAD_COLOR = "#fff";
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

  const ctx = canvas.getContext("2d");

  const render = (time) => {
    if (time - lastTime > FRAME) {
      for (let i = 0; i < TICK; i++) {
        universe.tick();
      }
      drawCells();
      lastTime = time;
    }
    animationId = requestAnimationFrame(render);
  };

  const draw = () => {
    drawGrid();
    drawCells();
  };

  const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = STROKE_COLOR;

    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    for (let i = 0; i <= height; i++) {
      ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, i * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
  };

  const drawCells = () => {
    const cellsPtr = universe.get_cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    // Alive cells.
    ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Alive) continue;

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 2,
          row * (CELL_SIZE + 1) + 2,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      }
    }

    // Dead cells.
    ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] !== Cell.Dead) continue;

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 2,
          row * (CELL_SIZE + 1) + 2,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      }
    }

    ctx.fill();
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

  cellColor.addEventListener("change", (event) => {
    ALIVE_COLOR = cellColor.value ? cellColor.value : "#000";
    drawCells();
  });

  borderColor.addEventListener("change", (event) => {
    STROKE_COLOR = borderColor.value ? borderColor.value : "#eee";
    drawGrid();
  });

  canvas.addEventListener("click", (event) => {
    const boundingRect = canvas.getBoundingClientRect();

    const canvasLeft = event.clientX - boundingRect.left;
    const canvasTop = event.clientY - boundingRect.top;

    const row = Math.floor(canvasTop / (CELL_SIZE + 1));
    const col = Math.floor(canvasLeft / (CELL_SIZE + 1));

    universe.toggle_cell(row, col);
    drawCells();
  });

  nextGeneration.addEventListener("click", (event) => {
    pause();
    for (let i = 0; i < TICK; i++) {
      universe.tick();
    }
    drawCells();
  });

  initial.addEventListener("click", (event) => {
    pause();
    universe.random();
    drawCells();
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
};

export default render;
