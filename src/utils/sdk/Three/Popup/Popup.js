import {
  CSS2DRenderer,
  CSS2DObject
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import "./popup.css";

/**
 * 气泡弹窗
 *
 * @author Dongjingru
 * @alias Popup
 * @constructor
 * @param {Object} options 参数
 */
class Popup {
  /**
   * 气泡弹窗
   *
   * @param {Object} options 选项。
   * @param {THREE.} options.scene 场景对象。
   * @param {Array} options.camera 场景相机。
   * @param {Element} options.dom 绘制三维场景的canvas所在的div元素
   */
  constructor(scene, camera, dom) {
    this.scene = scene;
    this.camera = camera;
    const labelDiv = document.createElement("div");
    labelDiv.className = "hcr3d-three-popup-label";
    const label = new CSS2DObject(labelDiv);
    this.label = label;

    const labelPanel = document.createElement("div");
    labelPanel.className = "hcr3d-three-popup-label-panel";
    this.labelPanel = labelPanel;
    const labelBottom = document.createElement("div");
    labelBottom.className = "hcr3d-three-popup-label-bottom";
    this.labelBottom = labelBottom;
    label.element.appendChild(labelPanel);
    label.element.appendChild(labelBottom);

    let labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";

    this.handler = {};
    dom.appendChild(labelRenderer.domElement);
    window.addEventListener(
      "resize",
      this.onWindowResize("resize", labelRenderer)
    );
    this.labelRenderer = labelRenderer;
    this.animate();
  }
  getCSS2DRenderer() {
    return this.labelRenderer;
  }
  addTo(object) {
    if (object.html) {
      this.label.element.innerHTML = object.html;
    } else {
      if (!this.label.element.contains(this.labelPanel)) {
        this.label.element.appendChild(this.labelPanel);
        this.label.element.appendChild(this.labelBottom);
      }
      this.labelPanel.textContent = object.label || "请设置object的lable或html";
    }

    let position = object.geometry.boundingSphere.center;
    this.label.position.x = position.x;
    this.label.position.y = position.y;
    this.label.position.z = position.z + 1.5;
    object.add(this.label);
  }
  removeFrom(object) {
    object.remove(this.label);
  }
  destroy() {
    cancelAnimationFrame(this.start);
    window.removeEventListener("resize", this.onWindowResize("resize"));
    this.handler = null;
    this.label = null;
    this.labelPanel = null;
    this.labelBottom = null;
  }
  onWindowResize(index, labelRenderer) {
    return (
      this.handler[index] ||
      (this.handler[index] = function() {
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
      })
    );
    // this.composer.setSize( window.innerWidth, window.innerHeight )
  }
  animate() {
    this.start = requestAnimationFrame(this.animate.bind(this));
    this.labelRenderer.render(this.scene, this.camera);
  }
}

export default Popup;
