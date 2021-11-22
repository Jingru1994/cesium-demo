import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

/**
 * 模型选择控制器
 *
 * @author Dongjingru
 * @alias PickModelController
 * @constructor
 * @param {Object} options 参数
 */
class PickModelController {
  /**
   * 控制模型是否可以高亮表示选中
   *
   * @param {Object} options 选项。
   * @param {THREE.WebGLRenderer} options.renderer 场景渲染器。
   * @param {THREE.Scene} options.scene 三维场景。
   * @param {THREE.Camera} options.camera 场景的相机。
   * @param {THREE.Object3D} [options.meshes] 可被选择的模型集合。
   * @param {Object} [options.outline] 高亮outline的设置项。
   * @param {Object} [options.outline.visibleEdgeColor] 轮廓线颜色。
   * @param {Object} [options.outline.hiddenEdgeColor] 被遮挡部分轮廓线颜色。
   * @param {Object} [options.outline.edgeStrength] 轮廓线粗。
   * @param {Object} [options.outline.edgeGolw] 边缘发光度。
   * @param {Object} [options.outline.edgeGolw] 边缘发散度。
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating PickModelController instance must provide options");
    }
    this.renderer = options.renderer;
    this.scene = options.scene;
    this.camera = options.camera;
    this.meshes = options.meshes || this.scene.children;
    const outlineOptions = options.outline;

    this.raycaster = new THREE.Raycaster();
    this.selectedObjects = [];
    this.selectedObject = undefined;
    this.handler = {};

    this.addOutlinePass(outlineOptions);
    this.animate();
  }
  startPick() {
    this.mouse = new THREE.Vector2();
    const that = this;
    debugger;

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
    this.selectedObjects = null;
    this.selectedObject = null;
    this.stopPick();
    this.handler = null;
    this.composer.removePass(this.outlinePass);
    this.outlinePass = null;
  }

  onPointerMove(index, that) {
    console.log(this);
    debugger;
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
            !that.selectedObject ||
            that.selectedObject !== intersects[0].object
          ) {
            that.selectedObject = intersects[0].object;
            that.selectedObjects = [];
            that.selectedObjects.push(that.selectedObject);
            that.outlinePass.selectedObjects = that.selectedObjects;
          }
        } else {
          that.selectedObject = null;
          that.outlinePass.selectedObjects = [];
        }
      })
    );
  }

  addOutlinePass(options) {
    const composer = new EffectComposer(this.renderer);
    this.composer = composer;
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerWidth),
      this.scene,
      this.camera
    );
    const visibleEdgeColor = (options && options.visibleEdgeColor) || "#FF0000";
    const hiddenEdgeColor = (options && options.hiddenEdgeColor) || "#1C0000";
    const edgeStrength = (options && options.edgeStrength) || 3;
    const edgeGolw = (options && options.edgeGolw) || 1.5;
    const edgeThickness = (options && options.edgeThickness) || 1;
    outlinePass.visibleEdgeColor.set(visibleEdgeColor);
    outlinePass.hiddenEdgeColor.set(hiddenEdgeColor);
    outlinePass.edgeStrength = edgeStrength;
    outlinePass.edgeGolw = edgeGolw;
    outlinePass.edgeThickness = edgeThickness;
    this.outlinePass = outlinePass;

    composer.addPass(outlinePass);

    let effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms["resolution"].value.set(
      1 / window.innerWidth,
      1 / window.innerWidth
    );
    composer.addPass(effectFXAA);
  }
  animate() {
    this.composer.render();
    requestAnimationFrame(this.animate.bind(this));
  }
}
export default PickModelController;
