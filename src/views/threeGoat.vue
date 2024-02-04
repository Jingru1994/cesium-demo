<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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

    await this.initScene();
    this.initControls();
    this.initLight();
    // await this.loadGoat();
    this.loadAbaga();
    this.loadLattice();
    this.addGround();
    this.addClickListener();
    this.animate();
    // const tween = new TWEEN.Tween({ x: 0 });
    // tween
    //   .to({ x: 360 }, 10000)
    //   .easing(TWEEN.Easing.Cubic.InOut)
    //   .onUpdate(({ x }) => {
    //     this.goat.rotation.y = (x * Math.PI) / 180;
    //   })
    //   .repeat(Infinity)
    //   .start();
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
      const map = await this.loadTexture("images/goatGround4.jpg");
      // map.wrapS = THREE.RepeatWrapping;
      // map.wrapT = THREE.RepeatWrapping;
      // map.repeat.set(16, 16);
      const fog = this.scene.fog;
      // const color = new THREE.Color(0xff0000);
      console.log(fog);
      const material = new ReflectorMaterial({
        map: map,
        transparent: true,
        opacity: 0.5,
        // fog: fog,
        dithering: true
      });
      material.uniforms.tReflect = this.reflector.renderTargetUniform;
      material.uniforms.uMatrix = this.reflector.textureMatrixUniform;
      const geometry = new THREE.PlaneGeometry(3500, 3500);

      const ground = new THREE.Mesh(geometry, material);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(-200, 0, -350);
      ground.add(this.reflector);

      ground.onBeforeRender = (renderer, scene, camera) => {
        this.visible = false;
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
    async loadLattice() {
      // const url = { mtl: "model/jingge/jingge.mtl", obj: "model/jingge/jingge.obj" };
      // const lattice = await this.loadOBJModel(url);
      const url = "model/jingge/jingge.gltf";
      const lattice = await this.loadGLTFModel(url);
      // const material = new THREE.MeshPhongMaterial({
      //   color: 0xffffff
      // });
      lattice.position.set(0, 1, 0);
      this.lattice = lattice;
      console.log("lattice");
      console.log(lattice);
      this.scene.add(lattice);
    },
    async loadGoat() {
      const url = "model/goat.obj";
      const goat = await this.loadOBJModel(url);
      const material = new THREE.MeshPhongMaterial({
        color: 0x0ac0fc,
        wireframe: true,
        emissive: 0x0ac0fc,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7
      });
      goat.children[0].material = material;
      // this.dirLight.target = goat;
      goat.position.set(0, 65, 0);
      this.goat = goat;
      this.scene.add(goat);
    },
    async loadAbaga() {
      // const url = {
      //   mtl: "model/abaga/阿巴嘎旗DG.mtl",
      //   obj: "model/abaga/阿巴嘎旗DG.obj"
      // };
      // const abaga = await this.loadOBJModel(url);
      const url = "model/abaga/阿巴嘎旗DG.gltf";
      const abaga = await this.loadGLTFModel(url);
      abaga.position.set(-1300, 0, -400);
      // abaga.scale.set(0.5, 0.5, 0.5);
      // abaga.children[2].material.roughness = 0.8;
      // abaga.children[0].children[1].children[1].material.roughness = 0.8;
      // // const texture = new THREE.TextureLoader().load(
      // //   "model/abaga2/地图贴图3.png"
      // // );
      // abaga.children[0].children[1].children[1].material.color = new THREE.Color(
      //   0x70ff7c
      // );
      // abaga.children[0].children[1].children[2].material.roughness = 1;
      // abaga.children[0].children[1].children[2].material.emissive = new THREE.Color(
      //   0x70faff
      // );
      // abaga.children[0].children[1].children[2].material.emissiveIntensity = 2;

      console.log(abaga);
      this.abaga = abaga;
      this.scene.add(abaga);
    },
    loadOBJModel(url) {
      const p = new Promise(resolve => {
        console.log(typeof url);
        if (typeof url === "object") {
          const loader = new OBJLoader();
          const mtlLoader = new MTLLoader();
          mtlLoader.load(url.mtl, materials => {
            console.log(materials);
            loader.setMaterials(materials);
            loader.load(
              url.obj,
              // called when resource is loaded
              object => {
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
        } else {
          const loader = new OBJLoader();
          loader.load(
            // resource URL
            url,
            // called when resource is loaded
            object => {
              this.adjustModel(object);
              this.model = object;
              resolve(object);
            },
            // called when loading is in progresses
            function(xhr) {
              console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            }
          );
        }
      });
      return p;
    },
    loadGLTFModel(url) {
      const p = new Promise(resolve => {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(
          url,
          gltf => {
            let model = gltf.scene;
            // this.adjustModel(model);
            resolve(model);
          },
          xhr => {
            // called while loading is progressing
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          error => {
            // called when loading has errors
            console.error("An error happened", error);
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
      // model.scale.set(0.2, 0.2, 0.2);
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
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    async initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      const texture = await this.loadTexture("images/goatBackground14.png");
      this.scene.background = texture;
      // this.scene.background = new THREE.Color(0xffffff);
      // scene.fog = new THREE.Fog("#06091B", 10, 3000);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      // renderer.physicallyCorrectLights = true;
      this.renderer = renderer;
      renderer.shadowMap.enabled = false;

      const camera = new THREE.PerspectiveCamera(
        25.5,
        1920 / 872.72,
        0.1,
        5000
      );
      camera.position.set(0, 965, 837);
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
      // this.initDirectionalLight1();
      // this.initDirectionalLight2();
      this.initPointLight1();
      this.initPointLight2();
      this.initPointLight3();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#A7A6FF", 0.1);
      this.scene.add(ambientLight);
    },
    initDirectionalLight1() {
      //方向光
      const dirLight = new THREE.DirectionalLight(0xa7a6ff, 0.4);
      //光源位置
      dirLight.position.set(0, 200, 0);
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光方向
      var debugCamera1 = new THREE.DirectionalLightHelper(dirLight);
      this.scene.add(debugCamera1);
    },
    initDirectionalLight2() {
      //方向光
      const dirLight = new THREE.DirectionalLight(0x547fff, 1);
      //光源位置
      dirLight.position.set(0, 200, 0);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 500;
      dirLight.shadow.camera.left = -100;
      dirLight.shadow.camera.right = 100;
      dirLight.shadow.camera.top = 100;
      dirLight.shadow.camera.bottom = -100;
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光方向
      var debugCamera1 = new THREE.DirectionalLightHelper(dirLight);
      this.scene.add(debugCamera1);
    },
    initPointLight1() {
      const pointLight = new THREE.PointLight(0xb1b0ff, 1, 2500, 2);
      pointLight.position.set(-60, 200, -80);
      this.scene.add(pointLight);
      const sphereSize = 10;
      const pointLightHelper = new THREE.PointLightHelper(
        pointLight,
        sphereSize
      );
      this.scene.add(pointLightHelper);
    },
    initPointLight2() {
      const pointLight = new THREE.PointLight(0x7d9dff, 3, 1000, 2);
      pointLight.position.set(-60, 200, -80);
      this.scene.add(pointLight);
      const sphereSize = 10;
      const pointLightHelper = new THREE.PointLightHelper(
        pointLight,
        sphereSize
      );
      this.scene.add(pointLightHelper);
    },
    initPointLight3() {
      const pointLight = new THREE.PointLight(0xffffff, 2, 400, 2);
      pointLight.position.set(-60, 150, -100);
      this.scene.add(pointLight);
      const sphereSize = 10;
      const pointLightHelper = new THREE.PointLightHelper(
        pointLight,
        sphereSize
      );
      this.scene.add(pointLightHelper);
    },
    animate() {
      TWEEN.update();
      this.renderer.render(this.scene, this.camera);
      if (this.controls) {
        this.controls.update(this.clock.getDelta()); //TrackballControls
        // this.reflector.update(this.renderer, this.scene, this.camera);
      }
      this.myAnimate = requestAnimationFrame(this.animate);
      // const time = this.clock.getElapsedTime();
      // this.goat.rotation.y += 0.01;
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
