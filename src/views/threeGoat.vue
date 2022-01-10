<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { Reflector } from "@/utils/widgets/Reflector/Reflector.js";
import { ReflectorMaterial } from "@/utils/widgets/Reflector/ReflectorMaterial.js";
import { getFullscreenTriangle } from "@/utils/widgets/Reflector/Utils3D.js";

import * as TWEEN from "@tweenjs/tween.js";
import { getPublicData } from "@/api/requestData.js";

export default {
  name: "MacroBigData",
  props: {
    saleList: {
      type: Array,
      require: true
    }
  },
  data() {
    return {
      // videoUrl: "images/大屏.mp4",
      videoUrl: "images/background.mp4",
      autoPlay: true,
      imgUrl: "images/daping4.png"
    };
  },
  created() {},
  async mounted() {
    this.clock = new THREE.Clock();
    this.handler = {};

    this.initScene();
    this.initControls();
    this.initLight();
    await this.loadModel();
    this.addGround();
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.handler = null;
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
    this.camera = null;
    this.renderer = null;
  },
  methods: {
    async addGround() {
      this.reflector = new Reflector();
      this.reflector.setSize(window.innerWidth, window.innerHeight);
      const map = await this.loadTexture("images/goatGround.jpg");
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(16, 16);
      const fog = this.scene.fog;
      const color = new THREE.Color(0xff0000);
      console.log(fog);
      const material = new ReflectorMaterial({
        map: map,
        fog: fog,
        dithering: true
      });
      material.uniforms.tReflect = this.reflector.renderTargetUniform;
      material.uniforms.uMatrix = this.reflector.textureMatrixUniform;
      const geometry = new THREE.PlaneGeometry(500, 500);

      const ground = new THREE.Mesh(geometry, material);
      ground.rotation.x = -Math.PI / 2;
      ground.add(this.reflector);

      ground.onBeforeRender = (renderer, scene, camera) => {
        this.visible = false;
        debugger;
        this.reflector.update(renderer, scene, camera);
        this.visible = true;
      };
      // ground.position.set(0, -65, 0);
      this.scene.add(ground);
      console.log(ground);
    },
    loadTexture(url) {
      const p = new Promise(resolve => {
        const loader = new THREE.TextureLoader();
        loader.load(url, texture => {
          resolve(texture);
        }),
          xhr => {
            const loadPercentage = Number(
              ((xhr.loaded / xhr.total) * 100).toFixed(0)
            );
            console.log(loadPercentage);
          },
          error => {
            console.error("An error happened", error);
          };
      });
      return p;
    },
    async loadModel() {
      const url = "model/goat.obj";
      const goat = await this.loadOBJModel(url);
      const material = new THREE.MeshPhongMaterial({
        color: 0x0ac0fc,
        wireframe: true,
        emissive: 0x0ac0fc,
        emissiveIntensity: 0.9,
        transparent: true
        // opacity: 0.8
      });
      goat.children[0].material = material;
      // this.dirLight.target = goat;
      goat.position.set(0, 65, 0);
      this.scene.add(goat);
    },
    loadOBJModel(url) {
      const p = new Promise(resolve => {
        const loader = new OBJLoader();
        loader.load(
          // resource URL
          url,
          // called when resource is loaded
          object => {
            console.log(object);
            this.scene.add(object);
            this.adjustModel(object);
            this.model = object;
            resolve(object);
          },
          // called when loading is in progresses
          function(xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          }
        );
      });
      return p;
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    adjustModel(model) {
      //调整模型尺寸
      model.scale.set(0.2, 0.2, 0.2);
      //调整模型中心
      model.traverse(function(o) {
        if (o.isMesh) {
          // o.geometry.computeBoundingBox()
          o.geometry.center();
        }
      });
      // console.log(model.position);
      // const box = new THREE.Box3().setFromObject(model);
      // const center = box.getCenter(new THREE.Vector3());
      // model.position.x += model.position.x - center.x;
      // model.position.y += model.position.y - center.y;
      // model.position.z += model.position.z - center.z;
    },
    addClickListener() {
      this.render.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      this.scene.background = new THREE.Color(0x00010b);
      scene.fog = new THREE.Fog("#06091B", 10, 3000);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = false;

      const camera = new THREE.PerspectiveCamera(
        25.5,
        1920 / 872.72,
        0.1,
        5000
      );
      camera.position.set(0, 200, 1000);
      this.camera = camera;

      let width = window.innerWidth;
      let height = window.innerHeight;
      let canvasPixelWidth = canvas.width / window.devicePixelRatio;
      let canvasPixelHeight = canvas.height / window.devicePixelRatio;
      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      window.addEventListener("resize", this.onWindowResize);
    },
    initControls(renderer) {
      let controls;
      if (renderer) {
        controls = new OrbitControls(this.camera, renderer.domElement);
      } else {
        controls = new OrbitControls(this.camera, this.renderer.domElement);
      }
      controls.zoomSpeed = 0.2;
      controls.enableDamping = true;
      // controls.enabled = false;

      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      this.initDirectionalLight();
      // this.initPointLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#0ac0fc", 0.9);
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#0ac0fc", 0.8);
      //光源位置
      dirLight.position.set(0, -10, 0);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 500;
      dirLight.shadow.camera.left = -400;
      dirLight.shadow.camera.right = 400;
      dirLight.shadow.camera.top = 400;
      dirLight.shadow.camera.bottom = -400;
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光方向
      // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
      // this.scene.add(debugCamera1)
    },
    initPointLight() {
      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(0, 50, 0);
      this.scene.add(pointLight);
    },
    animate() {
      this.renderer.render(this.scene, this.camera);
      if (this.controls) {
        this.controls.update(this.clock.getDelta()); //TrackballControls
        // this.reflector.update(this.renderer, this.scene, this.camera);
      }
      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.reflector.setSize(window.innerWidth, window.innerHeight);
    }
  }
};
</script>

<style lang="scss">
#app {
  overflow: hidden;
}
.three-view {
  // height: 872.72px;
  #three {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .videoDiv {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .topDiv .province {
    font-weight: bold;
    font-size: 18px;
    height: 18px;
    color: #5df5a0;
  }
  .topDiv .number {
    font-weight: bold;
    font-size: 12px;
    height: 12px;
  }
  .map-title {
    position: absolute;
    top: 226px;
    left: 458px;
    width: 220px;
    height: 32px;
    color: #ffffff;
    font: bold 18px/32px "Source Han Sans CN";
    background-image: url(~@/assets/title_background.png);
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
}
</style>
