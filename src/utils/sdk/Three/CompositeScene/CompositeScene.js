import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

/**
 * 复合场景。
 *
 * @author Dongjingru
 * @alias CompositeScene
 * @constructor
 * @param {Object} options 参数
 */
class CompositeScene {
  /**
   * 创建Three场景,包含场景，相机，渲染器，控制器，环境光。
   *
   * @param {Object} options 选项。
   * @param {Element.Canvas} [options.container 场景所用Canvas元素
   * @param {String} [options.backgroundColor] 场景背景颜色。
   * @param {String|Array} [options.fog] 场景雾 颜色|[颜色，受雾影响的最小值，手误影响的最大值]。
   * @param {Array} [options.cameraFrustum] 相机视锥[垂直视域，长宽比，近平面，远平面]
   * @param {String} [options.cameraPosition] 相机位置。
   * @param {String} [options.controlType] 控制器类型。
   * @param {String|Array} [options.light] 环境光 颜色|[颜色，光强度]
   * @param {Function} [options.animateFunction] 在animate中运行的回调函数，主要是动画相关
   * @param {Boolean} [options.initControls] 在animate中运行的回调函数，主要是动画相关
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating CompositeScene instance must provide options");
    }
    this.clock = new THREE.Clock();
    this.handler = {};
    this.initScene(options);
    const isInitControls =
      typeof options.initControls !== "undefined" ? options.initControls : true;
    const controlType = options.controlType || "orbit";
    if (isInitControls) {
      this.initControls(this.renderer, controlType);
    }
    this.initLight(options);
    this.animateContent = options.animateFunction;
    this.animate();
  }
  getScene() {
    return this.scene;
  }
  getCamera() {
    return this.camera;
  }
  getRenderer() {
    return this.renderer;
  }
  getControls() {
    return this.controls;
  }
  getAmbientLight() {
    return this.ambientLight;
  }
  initScene(options) {
    const canvas = options.container;
    const color = options.backgroundColor || 0xd6d6d6;
    const fog = options.fog;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(color);
    if (fog) {
      scene.fog =
        fog instanceof Array
          ? new THREE.Fog(...[fog])
          : new THREE.Fog(fog, 300, 500);
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false;
    renderer.sortObject = false;
    const cameraFrustum = options.cameraFrustum || [
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    ];
    const camera = new THREE.PerspectiveCamera(...cameraFrustum);
    //调整camera视角
    const cameraPosition = options.cameraPosition || [50, 50, 50];
    camera.position.set(...cameraPosition);

    // 避免模型很模糊的现象
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    window.addEventListener(
      "resize",
      this.onWindowResize("resize", renderer, camera)
    );
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }
  initControls(renderer, controlType) {
    const rendererDom = renderer.domElement;
    const type = controlType || "orbit";
    let controls;
    switch (type) {
      default:
        controls = new OrbitControls(this.camera, rendererDom);
        break;
      case "drag":
        controls = new DragControls(this.objects, this.camera, rendererDom);
        break;
      case "first":
        controls = new FirstPersonControls(this.camera, rendererDom);
        break;
      case "fly":
        controls = new FlyControls(this.camera, rendererDom);
        break;
      case "orbit":
        controls = new OrbitControls(this.camera, rendererDom);
        controls.enableDamping = true;

        break;
      case "pointLock":
        controls = new PointerLockControls(this.camera, rendererDom);
        break;
      case "trackBall":
        controls = new TrackballControls(this.camera, rendererDom);
        controls.enableDamping = true;
        break;
      case "transform":
        controls = new TransformControls(this.camera, rendererDom);
        controls.rotateSpeed = 2.0;
        controls.zoomSpeed = 2.0;
        controls.panSpeed = 1.0;
        break;
    }
    this.controls = controls;
  }
  initLight(options) {
    this.initAmbientLight(options);
    // this.initDirectionalLight();
  }
  initAmbientLight(options) {
    //环境光
    const light = options.light || ["#ffffff", 1];
    const ambientLight =
      light instanceof Array
        ? new THREE.AmbientLight(...light)
        : new THREE.AmbientLight(light, 1);
    this.ambientLight = ambientLight;
    this.scene.add(ambientLight);
  }
  initDirectionalLight() {
    //方向光
    const dirLight = new THREE.DirectionalLight("#ffffff", 0.1);
    //光源位置
    dirLight.position.set(40, 80, 30);
    //可以产生阴影
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.dirLight = dirLight;
    this.scene.add(dirLight);
  }
  animate() {
    //three需要动画循环函数，每一帧都执行这个函数
    this.renderer.render(this.scene, this.camera);
    if (this.controls) {
      this.controls.update(this.clock.getDelta());
    }

    typeof this.animateContent === "function" && this.animateContent();
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  onWindowResize(index, renderer, camera) {
    return (
      this.handler[index] ||
      (this.handler[index] = function() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      })
    );
    // this.composer.setSize( window.innerWidth, window.innerHeight )
  }
  destroy() {
    window.removeEventListener("resize", this.onWindowResize("resize"));
    cancelAnimationFrame(this.start);
    this.scene.traverse(item => {
      if (item.isMesh || item instanceof THREE.Sprite) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
          });
        } else {
          item.material.dispose();
        }
      }
    });
    THREE.Cache.clear();
    this.scene.clear();
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.ambientLight = null;
  }
}

export default CompositeScene;
