import * as THREE from "three";

/**
 * 模型选择控制器
 *
 * @author Dongjingru
 * @alias PickModelController3
 * @constructor
 * @param {Object} options 参数
 */
class PickModelController3 {
  /**
   * 控制模型是否可以高亮表示选中
   *
   * @param {Object} options 选项。
   * @param {THREE.WebGLRender} options.renderer 场景渲染器。
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
    this.onCallback = options.onCallback;
    this.leaveCallback = options.leaveCallback;

    this.raycaster = new THREE.Raycaster();
    this.selectedObject = undefined;
    this.handler = {};
  }
  startPick() {
    this.mouse = new THREE.Vector2();
    const that = this;
    this.renderer.domElement.addEventListener(
      "pointermove",
      this.onPointerMove("pointermove", that)
    );
  }
  stopPick() {
    this.renderer.domElement.removeEventListener(
      "pointermove",
      this.onPointerMove("pointermove")
    );
  }
  destroy() {
    this.raycaster = null;
    this.selectedObject = null;
    this.stopPick();
    this.handler = null;
  }

  onPointerMove(index, that) {
    return (
      this.handler[index] ||
      (this.handler[index] = function(event) {
        if (event.isPrimary === false) return;
        that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        that.raycaster.setFromCamera(that.mouse, that.camera);
        const intersects = that.raycaster.intersectObject(that.meshes, true);

        if (intersects.length > 0) {
          if (
            that.selectedObject &&
            that.selectedObject !== intersects[0].object
          ) {
            if (that.selectedObject.material instanceof Array) {
              that.selectedObject.material[0].color.set(
                that.selectedObject.currentColor
              );
            } else {
              that.selectedObject.material.color.set(
                that.selectedObject.currentColor
              );
            }
          }
          if (
            !that.selectedObject ||
            that.selectedObject !== intersects[0].object
          ) {
            that.selectedObject = intersects[0].object;
            if (that.selectedObject.material instanceof Array) {
              that.selectedObject.currentColor = that.selectedObject.material[0].color.getStyle();
              that.selectedObject.material[0].color.set(that.color);
            } else {
              that.selectedObject.currentColor = that.selectedObject.material.color.getStyle();
              that.selectedObject.material.color.set(that.color);
            }
            typeof that.onCallback === "function" &&
              that.onCallback(that.selectedObject);
          }
        } else {
          if (that.selectedObject) {
            if (that.selectedObject.material instanceof Array) {
              that.selectedObject.material[0].color.set(
                that.selectedObject.currentColor
              );
            } else {
              that.selectedObject.material.color.set(
                that.selectedObject.currentColor
              );
            }
            typeof that.leaveCallback === "function" &&
              that.leaveCallback(that.selectedObject);
          }
          that.selectedObject = null;
        }
      })
    );
  }
}
export default PickModelController3;
