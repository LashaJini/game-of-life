import { memory } from "game-of-life/game_of_life_bg";
import { Universe, Cell } from "game-of-life";

const cell_range = document.querySelector("#cell-size");
const play_pause = document.querySelector("#play-pause");
const clear = document.querySelector("#clear");
const tick_speed = document.querySelector("#tick-speed");

let CELL_SIZE = parseInt(cell_range.value);
const ALIVE_COLOR = "#000";
const DEAD_COLOR = "#fff";
const STROKE_COLOR = "#eee";
let TICK = parseInt(tick_speed.value);

const universe = Universe.new(64, 64);
universe.random();
const width = universe.get_width();
const height = universe.get_height();

const canvas = document.querySelector(".scene");
canvas.width = (CELL_SIZE + 1) * width + 1;
canvas.height = (CELL_SIZE + 1) * height + 1;

const ctx = canvas.getContext("2d");

const getIndex = (row, col) => {
  return row * width + col;
};

let animationId = null;
const render = () => {
  for (let i = 0; i < TICK; i++) {
    universe.tick();
  }
  draw();
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
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Alive) continue;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  // Dead cells.
  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Dead) continue;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

const play = () => {
  play_pause.textContent = "pause";

  animationId = requestAnimationFrame(render);
  return true;
};

const pause = () => {
  play_pause.textContent = "play";

  cancelAnimationFrame(animationId);
  animationId = null;
  return true;
};

cell_range.addEventListener("change", (event) => {
  CELL_SIZE = parseInt(event.target.value);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = (CELL_SIZE + 1) * width + 1;
  canvas.height = (CELL_SIZE + 1) * height + 1;

  !animationId && draw();
});

play_pause.addEventListener("click", (event) => {
  animationId ? pause() : play();
});

tick_speed.addEventListener("change", (event) => {
  TICK = parseInt(event.target.value);
  console.log(TICK);

  pause() && play();
});

canvas.addEventListener("click", (event) => {
  const boundingRect = canvas.getBoundingClientRect();

  const canvasLeft = event.clientX - boundingRect.left;
  const canvasTop = event.clientY - boundingRect.top;

  const row = Math.floor(canvasTop / (CELL_SIZE + 1));
  const col = Math.floor(canvasLeft / (CELL_SIZE + 1));

  universe.toggle_cell(row, col);
  draw();
});

clear.addEventListener("click", (event) => {
  pause();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  universe.empty();
  draw();
});

draw();
play();
