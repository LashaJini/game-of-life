import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import * as THREE from "three";

function initScene() {
  return new THREE.Scene();
}

function initCamera() {
  let camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 2000;
  return camera;
}

function initRenderer(element, width, height) {
  let renderer = new CSS3DRenderer();
  renderer.setSize(width || window.innerWidth, height || window.innerHeight);
  renderer.domElement.style.position = "absolute";
  element && element.appendChild(renderer.domElement);
  return renderer;
}

function initControls(camera, element) {
  let controls = new TrackballControls(camera, element);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 500;
  controls.maxDistance = 7000;
  return controls;
}

function createCSSObjects(objs, cb) {
  let objects = [];

  let i = 0;
  objs.forEach(() => {
    let wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    wrapper.setAttribute("nth", i);
    wrapper.onclick = () => cb(wrapper);

    let element = document.createElement("div");
    element.classList.add("element");
    element.style.backgroundColor = "#eee";

    wrapper.appendChild(element);

    let object = new CSS3DObject(wrapper);
    object.position.x = Math.random() * 3000 - 1000;
    object.position.y = Math.random() * 3000 - 1000;
    object.position.z = Math.random() * 3000 - 1000;

    objects.push(object);
    i++;
  });

  return objects;
}

function createTable(css3dObjects, options) {
  let table = [];
  let cols = (options && options.cols) || 10;
  let rows = cols;
  let halfP = (options && options.halfP) || 165;

  for (let i = 0; i < css3dObjects.length; i++) {
    let object = new THREE.Object3D();
    object.position.x = halfP * (i % cols) - 400;
    object.position.y = -halfP * Math.floor(i / rows) + 400;
    object.position.z = 0;
    table.push(object);
  }

  return table;
}

export {
  initScene,
  initCamera,
  initRenderer,
  initControls,
  createCSSObjects,
  createTable,
};
