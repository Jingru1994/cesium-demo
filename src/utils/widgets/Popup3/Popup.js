import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./popup.css";

class Popup {
  label;
  #labelRenderer;
  #scene;
  #camera;

  constructor(scene, camera, dom) {
    this.#scene = scene;
    this.#camera = camera;
    const labelDiv = document.createElement("div");
    labelDiv.className = "three-popup-label";
    const label = new CSS2DObject(labelDiv);
    this.label = label;

    this.label.element.innerHTML();

    this.label.element.appendChild(document.createElement("div"));
    this.label.element.appendChild(document.createElement("div"));
    console.log(this.label);

    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    dom.appendChild(labelRenderer.domElement);
    this.#labelRenderer = labelRenderer;
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
    this.animate();
  }
  getCSS2DRenderer() {
    return this.#labelRenderer;
  }
  addTo(object) {
    this.label.element.innerText = object.label;
    let position = object.geometry.boundingSphere.center;
    this.label.position.x = position.x;
    this.label.position.y = position.y;
    this.label.position.z = position.z + 1.5;
    object.add(this.label);
  }
  removeFrom(object) {
    object.remove(this.label);
  }
  onWindowResize() {
    this.#labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.#labelRenderer.render(this.#scene, this.#camera);
  }
}

export default Popup;
