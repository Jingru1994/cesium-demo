import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let scene, camera, renderer, clock, controls;
function createScene(canvas) {
  // let scene, camera, renderer;
  [scene, camera, renderer] = initScene(canvas);
  clock = new THREE.Clock();
  console.log(scene);
  controls = initControls(camera, renderer);
  initLight(scene);
  animate(scene, camera, renderer, controls, clock);
  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
    controls: controls,
    clock: clock
  };
}
function initScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06091b);
  scene.fog = new THREE.Fog("#06091B", 300, 500);
  // const canvas = document.querySelector("#three");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.shadowMap.enabled = true;
  renderer.autoClear = false;
  renderer.sortObject = false;
  //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );

  //调整camera视角
  camera.position.set(-4.025961174328703, 64.68049465988572, 91.83877121577603);

  console.log(camera);

  // 避免模型很模糊的现象
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;
  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  window.addEventListener("resize", onWindowResize(renderer, camera));
  return [scene, camera, renderer];
}
function initControls(camera, renderer) {
  let controls;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(
    -1.7073951515135204,
    -12.370792980039933,
    3.121498692070242
  );
  // 缩放范围
  controls.minDistance = 50;
  // controls.maxDistance = 300;
  // 上下旋转范围
  // controls.minPolarAngle = 0;
  // controls.maxPolarAngle = Math.PI/3;
  // 左右旋转范围
  // controls.minAzimuthAngle = -Math.PI * (100 / 180);
  // controls.maxAzimuthAngle = Math.PI * (100 / 180);
  return controls;
}
function initLight(scene) {
  initAmbientLight(scene);
  initDirectionalLight(scene);
}
function initAmbientLight(scene) {
  //环境光
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);
  scene.add(ambientLight);
}
function initDirectionalLight(scene) {
  //方向光
  const dirLight = new THREE.DirectionalLight("#fff", 0.1);
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
  scene.add(dirLight);
}
function animate() {
  //three需要动画循环函数，每一帧都执行这个函数
  renderer.render(scene, camera);

  controls.update(clock.getDelta()); //TrackballControls
  requestAnimationFrame(animate);
}
function onWindowResize(renderer, camera) {
  // this.composer.setSize( window.innerWidth, window.innerHeight )
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
export default createScene;
