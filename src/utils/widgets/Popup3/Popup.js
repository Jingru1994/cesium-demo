import {
  CSS2DRenderer,
  CSS2DObject
} from "@/utils/widgets/CSS2DRenderer/CSS2DRenderer.js";
import "./popup.css";

class Popup {
  label;
  #labelRenderer;
  #scene;
  #camera;
  #labelPanel;
  #labelLine;

  constructor(scene, camera, dom) {
    this.createHtmlElement();
    this.#scene = scene;
    this.#camera = camera;
    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    dom.appendChild(labelRenderer.domElement);
    labelRenderer.domElement.appendChild(this.label.element);
    this.#labelRenderer = labelRenderer;
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
    this.animate();
  }
  getTextContent() {
    return this.textContent;
  }
  createHtmlElement() {
    const labelDiv = document.createElement("div");
    labelDiv.className = "three-popup-label";
    const label = new CSS2DObject(labelDiv);
    this.label = label;

    const labelLine = document.createElement("div");
    labelLine.className = "three-popup-label-line";
    this.#labelLine = labelLine;
    const labelPanel = document.createElement("div");
    labelPanel.className = "three-popup-label-panel";
    this.textContent = document.createElement("div");
    this.textContent.className = "text-content";
    labelPanel.appendChild(this.textContent);

    this.#labelPanel = labelPanel;

    label.element.appendChild(labelLine);
    label.element.appendChild(labelPanel);
  }
  getCSS2DRenderer() {
    return this.#labelRenderer;
  }
  setAddCallback(callback) {
    this.callback = callback;
  }
  addTo(object) {
    this.remove();
    setTimeout(() => {
      typeof this.callback === "function" && this.callback(object);
      let position = object.geometry.boundingSphere.center;
      this.label.position.copy(position);
      object.add(this.label);
      this.label.element.classList.add("hover");
      this.#labelLine.classList.add("hover");
      this.#labelPanel.classList.add("hover");
      this.textContent.classList.add("hover");
    }, 500);
  }
  remove() {
    this.label.element.classList.remove("hover");
    this.#labelLine.classList.remove("hover");
    this.#labelPanel.classList.remove("hover");
    this.textContent.classList.remove("hover");
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
