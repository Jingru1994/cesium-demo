import {
  CSS2DRenderer,
  CSS2DObject
} from "@/utils/widgets/CSS2DRenderer/CSS2DRenderer.js";
import * as THREE from "three";
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
    const topDiv = document.createElement("div");
    topDiv.className = "topDiv";
    this.textContent.appendChild(topDiv);
    this.province = document.createElement("div");
    this.province.className = "text province";
    topDiv.appendChild(this.province);
    this.number = document.createElement("div");
    this.number.className = "text number ";
    topDiv.appendChild(this.number);
    const orderDiv = document.createElement("div");
    orderDiv.className = "bottomDiv";
    this.textContent.appendChild(orderDiv);
    const orderField = document.createElement("div");
    orderField.className = "text orderNum field";
    orderField.innerText = "订单数量";
    orderDiv.appendChild(orderField);
    this.orderNum = document.createElement("div");
    this.orderNum.className = "text orderNum value";
    orderDiv.appendChild(this.orderNum);
    const salesDiv = document.createElement("div");
    salesDiv.className = "bottomDiv";
    this.textContent.appendChild(salesDiv);
    const salesField = document.createElement("div");
    salesField.className = "text sales field";
    salesField.innerText = "销售额";
    salesDiv.appendChild(salesField);
    this.sales = document.createElement("div");
    this.sales.className = "text sales value";
    salesDiv.appendChild(this.sales);

    this.#labelPanel = labelPanel;

    label.element.appendChild(labelLine);
    label.element.appendChild(labelPanel);
  }
  getCSS2DRenderer() {
    return this.#labelRenderer;
  }
  addTo(object) {
    this.remove();
    setTimeout(() => {
      this.province.innerText = object.name;
      this.number.innerText = "TOP " + object.number;
      this.orderNum.innerText = object.orderNum + "万笔";
      this.sales.innerText = object.sales + "万元";
      let position = object.geometry.boundingSphere.center;
      console.log(position);
      this.label.position.x = position.x;
      this.label.position.y = position.y;
      this.label.position.z = position.z;
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
