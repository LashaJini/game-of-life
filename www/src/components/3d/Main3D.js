import React from "react";
import styled from "styled-components";
import { isPositiveNumber, getIndex } from "../../utils/helpers";
import {
  initScene,
  initCamera,
  initRenderer,
  initControls,
  createCSSObjects,
  createTable,
} from "./logic";
let Universe, Cell, memory;
import("game-of-life").then((module) => {
  Universe = module.Universe;
  Cell = module.Cell;
});
import("game-of-life/game_of_life_bg.wasm").then((module) => {
  memory = module.memory;
});
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { Menu } from "../";
import "./Main3D.css";

let data = Array(64).fill(0);
const DEAD_COLOR = "#fff";

// TODO: transition breaks if clicked "random" early
// TODO: first play does not change
const Main3D = () => {
  const [playing, setPlaying] = React.useState(false);
  const sceneRef = React.useRef();
  const animationId = React.useRef();
  const tableOptions = React.useRef();

  /* 3D */
  const scene = React.useRef();
  const camera = React.useRef();
  const renderer = React.useRef();
  const controls = React.useRef();

  const render = React.useRef();
  const resize = React.useRef();
  const animate = React.useRef();
  const renderUniverse = React.useRef();

  const objects = React.useRef();
  const targets = React.useRef({ random: [], table: [] });

  /* Menu */
  const cellSize = React.useRef(8);
  const cellColor = React.useRef("#000");
  const strokeColor = React.useRef("#eee");
  const tickSpeed = React.useRef(1);
  const [tick, setTick] = React.useState(1);
  const animationSpeed = React.useRef(1);
  const frame = React.useRef(1000);
  const [rowInput, setRowInput] = React.useState(null);
  const [colInput, setColInput] = React.useState(null);

  const universe = React.useRef();
  const lastTime = React.useRef(0);

  /* universe */
  React.useEffect(() => {
    universe.current = Universe.new(
      isPositiveNumber(rowInput) ? rowInput : 8,
      isPositiveNumber(colInput) ? colInput : 8
    );
  }, []);

  /* 3D */
  React.useEffect(() => {
    scene.current = initScene();
    camera.current = initCamera();
    renderer.current = initRenderer(
      sceneRef.current,
      window.innerWidth * 0.8,
      window.innerHeight
    );

    controls.current = initControls(
      camera.current,
      renderer.current.domElement
    );
    let tmp = controls.current;
    tmp.addEventListener("change", render.current);

    // initial
    tableOptions.current = {
      cols: 8, // Math.sqrt(data.length)
      halfP: 8 * cellSize.current + 5,
    };

    objects.current = createCSSObjects(data, toggleCell);
    targets.current.random = objects.current;
    targets.current.table = createTable(objects.current, tableOptions.current);

    targets.current.random.forEach((object) => scene.current.add(object));
    window.addEventListener("resize", resize.current);
    // animationId.current = requestAnimationFrame(animate.current);
    animate.current();
    transform(objects.current, targets.current.table, 1000, render.current);

    return () => {
      cleanUpScene();
      tmp.removeEventListener("change", render.current);
      window.removeEventListener("resize", resize.current);
    };
  }, []);

  function cleanUpScene() {
    while (scene.current.children.length > 0) {
      scene.current.remove(scene.current.children[0]);
    }
  }

  function transform(objects, targets, duration, cb) {
    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {
      let object = objects[i];
      let target = targets[i];

      new TWEEN.Tween(object.position)
        .to(
          {
            x: target.position.x,
            y: target.position.y,
            z: target.position.z,
          },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to(
          {
            x: target.rotation.x,
            y: target.rotation.y,
            z: target.rotation.z,
          },
          Math.random() * duration + duration
        )
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }

    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(cb)
      .start();
  }

  render.current = () => {
    renderer.current.render(scene.current, camera.current);
  };

  resize.current = () => {
    camera.current.aspect = window.innerWidth / window.innerHeight;
    camera.current.updateProjectionMatrix();
    renderer.current.setSize(
      window.innerWidth *
        0.8 /* this is because IntoGridItem.js:WhatAmIWrapper width is 80vw */,
      window.innerHeight
    );
    render.current();
  };

  animate.current = () => {
    requestAnimationFrame(animate.current);
    TWEEN.update();
    controls.current.update();
  };

  const changeCellSize = (event) => {
    let newCellSize = parseInt(event.target.value);
    cellSize.current = newCellSize;
    document.querySelectorAll(".wrapper").forEach((elem) => {
      elem.style.width = 8 * newCellSize + "px";
      elem.style.height = 8 * newCellSize + "px";
    });

    tableOptions.current.halfP = 8 * newCellSize + 5;

    targets.current.table = createTable(objects.current, tableOptions.current);
    transform(objects.current, targets.current.table, 1000, render.current);
  };

  const cellColorChange = (event) => {
    cellColor.current = event.target.value || "#000";
    drawCells();
  };

  const strokeColorChange = (event) => {
    strokeColor.current = event.target.value || "#eee";
    document.querySelectorAll(".element").forEach((elem) => {
      elem.style.border = `1px solid ${strokeColor.current}`;
      elem.style.boxShadow = `0px 0px 12px ${strokeColor.current}`;
    });
  };

  const changeTickSpeed = (event) => {
    tickSpeed.current = parseInt(event.target.value);
    setTick(tickSpeed.current);
  };

  const changeAnimationSpeed = (event) => {
    let tmp = parseInt(event.target.value);
    animationSpeed.current = tmp;
    frame.current = 1000 / tmp;
  };

  const handleRowChange = (event) => {
    setRowInput(Math.floor(parseInt(event.target.value)));
  };
  const handleColChange = (event) => {
    setColInput(Math.floor(parseInt(event.target.value)));
  };

  const changeUniverseSize = () => {
    if (isPositiveNumber(rowInput) && isPositiveNumber(colInput)) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;

      let width = rowInput;
      let height = colInput;
      universe.current.set_width(width);
      universe.current.set_height(height);
      // we are "emptying" after, because universe must be filled with dead cells.
      universe.current.empty();

      cleanUpScene();
      let data = Array(width * height).fill(0);
      objects.current = createCSSObjects(data, toggleCell);

      tableOptions.current.cols = width;
      targets.current.random = objects.current;
      targets.current.table = createTable(
        objects.current,
        tableOptions.current
      );
      targets.current.random.forEach((object) => {
        object.element.style.width = 8 * cellSize.current + "px";
        object.element.style.height = 8 * cellSize.current + "px";
        object.element.style.border = `1px solid ${strokeColor.current}`;
        object.element.style.boxShadow = `0px 0px 12px ${strokeColor.current}`;
        scene.current.add(object);
      });
      transform(objects.current, targets.current.table, 1000, render.current);
      animationId.current = requestAnimationFrame(renderUniverse.current);
    }
  };

  const drawCells = () => {
    let width = universe.current.get_width();
    let height = universe.current.get_height();
    const cellsPtr = universe.current.get_cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(width, row, col);
        if (cells[idx] === Cell.Alive) {
          targets.current.random[
            idx
          ].element.firstElementChild.style.backgroundColor = cellColor.current;
        } else {
          targets.current.random[
            idx
          ].element.firstElementChild.style.backgroundColor = DEAD_COLOR;
        }
      }
    }
  };

  const handlePlay = (event, pause) => {
    setPlaying(() => {
      if (!animationId.current && !pause) {
        animationId.current = requestAnimationFrame(renderUniverse.current);
        return true;
      }

      cancelAnimationFrame(animationId.current);
      animationId.current = null;
      return false;
    });
  };

  renderUniverse.current = (time) => {
    if (time - lastTime.current > frame.current) {
      for (let i = 0; i < tickSpeed.current; i++) {
        universe.current.tick();
      }
      drawCells();
      lastTime.current = time;
    }
    animationId.current = requestAnimationFrame(renderUniverse.current);
  };

  const initial = () => {
    handlePlay(null, true);
    universe.current.random();
    drawCells();
  };

  const nextGeneration = () => {
    handlePlay(null, true);
    for (let i = 0; i < tickSpeed.current; i++) {
      universe.current.tick();
    }
    drawCells();
  };

  const clear = () => {
    handlePlay(null, true);
    universe.current.empty();
    targets.current.random.forEach((obj) => {
      obj.element.firstElementChild.style.backgroundColor = DEAD_COLOR;
    });
  };

  const reset = () => {
    handlePlay(null, true);
    universe.current.reset();
    drawCells();
  };

  const toggleCell = (elem) => {
    handlePlay(null, true);
    let idx = parseInt(elem.getAttribute("nth"));
    let row = Math.floor(idx / universe.current.get_width());
    let col = idx % universe.current.get_width();
    universe.current.toggle_cell(row, col);
    drawCells();
  };

  return (
    <Wrapper className="3d-wrapper">
      <Scene ref={sceneRef} className="scene"></Scene>
      <MenuWrapper className="menu-wrapper">
        <Menu
          handlePlay={handlePlay}
          playing={playing}
          nextGeneration={nextGeneration}
          clear={clear}
          reset={reset}
          initial={initial}
          cellSize={cellSize.current}
          changeCellSize={changeCellSize}
          cellColorChange={cellColorChange}
          cellColor={cellColor.current}
          strokeColorChange={strokeColorChange}
          strokeColor={strokeColor}
          changeTickSpeed={changeTickSpeed}
          tickSpeed={tickSpeed.current}
          tick={tick}
          changeAnimationSpeed={changeAnimationSpeed}
          animationSpeed={animationSpeed.current}
          changeUniverseSize={changeUniverseSize}
          handleRowChange={handleRowChange}
          handleColChange={handleColChange}
        />
      </MenuWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;
const Scene = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  &:nth-child(1) {
    top: 0;
    left: 0;
    transform: translate(20%);
  }
`;
const MenuWrapper = styled.div`
  position: absolute;
  bottom: 5%;
`;

export default Main3D;
