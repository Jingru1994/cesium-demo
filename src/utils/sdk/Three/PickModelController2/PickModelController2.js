import * as THREE from "three";

/**
 * 模型选择控制器
 *
 * @author Dongjingru
 * @alias PickModelController2
 * @constructor
 * @param {Object} options 参数
 */
class PickModelController2 {
  /**
   * 控制模型是否可以高亮表示选中
   *
   * @param {Object} options 选项。
   * @param {THREE.WebGLRenderer} options.renderer 场景渲染器。
   * @param {THREE.Scene} options.scene 三维场景。
   * @param {THREE.Camera} options.camera 场景的相机。
   * @param {THREE.Object3D} [options.meshes] 可被选择的模型集合。
   * @param {Object} [options.color] 高亮发光颜色。
   */
  constructor(options) {
    if (!options) {
      throw Error(
        "Creating PickModelController2 instance must provide options"
      );
    }
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.camera = options.camera;
    this.meshes = options.meshes || this.scene.children;
    this.color = options.color || "#FF3336";

    this.raycaster = new THREE.Raycaster();
    this.selectedObject = undefined;
  }
  startPick() {
    this.mouse = new THREE.Vector2();
    const that = this;
    this.stop = false;

    this.renderer.domElement.addEventListener("pointermove", function _listener(
      event
    ) {
      if (that.stop) {
        that.renderer.domElement.removeEventListener("pointermove", _listener);
      } else {
        that.onPointerMove(event, that);
      }
    });
  }
  stopPick() {
    this.stop = true;
  }
  destroy() {
    this.stop = true;
    this.raycaster = null;
    this.selectedObject = null;
  }

  onPointerMove(event, that) {
    if (event.isPrimary === false) return;
    that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    that.raycaster.setFromCamera(that.mouse, that.camera);
    const intersects = that.raycaster.intersectObject(that.meshes, true);

    if (intersects.length > 0) {
      if (that.selectedObject && that.selectedObject !== intersects[0].object) {
        that.selectedObject.material.emissive.set(
          that.selectedObject.currentHex
        );
      }
      if (
        !that.selectedObject ||
        that.selectedObject !== intersects[0].object
      ) {
        that.selectedObject = intersects[0].object;
        that.selectedObject.currentHex = that.selectedObject.material.emissive.getStyle();
        that.selectedObject.material.emissive.set(that.color);
      }
    } else {
      if (that.selectedObject) {
        that.selectedObject.material.emissive.set(
          that.selectedObject.currentHex
        );
      }
      that.selectedObject = null;
    }
  }
}
export default PickModelController2;
