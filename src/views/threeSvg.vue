<template>
  <div class="three-view">
    <div class="videoDiv">
      <video id="myVideo" muted :autoplay="true" width="100%">
        <source :src="videoUrl" type="video/mp4" />
      </video>
    </div>
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

import * as TWEEN from "@tweenjs/tween.js";
import Popup from "@/utils/widgets/Popup3/Popup.js";
import GlowCylinder from "@/utils/widgets/GlowCylinder/GlowCylinder.js";
import { getPublicData } from "@/api/requestData.js";
import exampleData from "@/utils/saleData.js";

export default {
  name: "ThreeTerrain",
  data() {
    return {
      videoUrl: "images/大屏.mp4",
      autoPlay: true
    };
  },
  created() {},
  async mounted() {
    this.clock = new THREE.Clock();

    this.initScene();
    this.addState();
    // this.initControls();
    this.initLight();
    const group = await this.loadSvg();
    setTimeout(() => {
      this.getPosition(group);
    }, 5000);
    this.saleData = exampleData;
    this.createCylinder();
    this.addPickObject();

    this.addClickListener();
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
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
    loadSvg() {
      const p = new Promise(resolve => {
        const loader = new SVGLoader();

        // load a SVG resource
        loader.load(
          // resource URL
          "data/china.svg",
          // called when the resource is loaded
          data => {
            const paths = data.paths;
            const group = new THREE.Group();

            for (let i = 0; i < paths.length; i++) {
              const path = paths[i];

              const material = new THREE.MeshBasicMaterial({
                color: 0x19bf9e,
                side: THREE.DoubleSide,
                depthWrite: false,
                transparent: true,
                opacity: 0
              });

              const shapes = SVGLoader.createShapes(path);

              for (let j = 0; j < shapes.length; j++) {
                const shape = shapes[j];
                const geometry = new THREE.ShapeGeometry(shape);
                const mesh = new THREE.Mesh(geometry, material);
                mesh.name = path.userData.node.id;
                mesh.number = 10;
                mesh.orderNum = 10;
                mesh.sales = 10;
                group.add(mesh);
              }
            }
            group.rotation.x = Math.PI / 2;
            this.adjustModel(group);

            this.scene.add(group);
            this.map = group;
            console.log(group);
            resolve(group);
          },
          // called when loading is in progresses
          function(xhr) {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          // called when loading has errors
          function(error) {
            console.log("An error happened", error);
          }
        );
      });
      return p;
      // instantiate a loader
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async getPosition(group) {
      // let chinaGeometry = await this.getData("data/china.json");
      // let positionArray = [];
      // for (let object of group.children) {
      //   let o = {};
      //   let coincident = chinaGeometry.find(
      //     feature => feature.properties.adcode === object.name
      //   );
      //   o["code"] = object.name;
      //   o["name"] = coincident.properties.name;
      //   o["sales"] = (Math.random() * 10).toFixed(2);
      //   positionArray.push(o);
      // }
      // console.log(positionArray);
      let positionArray = {};
      for (let object of group.children) {
        let position = object.geometry.boundingSphere.center;
        // let boxHelper;
        // boxHelper = new THREE.BoxHelper(object, 0x000000); //显示包围盒
        // this.scene.add(boxHelper);
        let bBox = new THREE.Box3();
        bBox.setFromObject(object);

        let mLen = bBox.max.x - bBox.min.x;
        let mHei = bBox.max.y - bBox.min.y;
        let x = bBox.min.x + mLen / 2;
        let y = bBox.min.y + mHei / 2;
        let key = object.name;
        positionArray[key] = [x, y, 0];
        positionArray[key] = [
          position.x - 599.8350146412849,
          position.y - 583.4749984741211,
          position.z
        ];
      }
      console.log(positionArray);
    },
    async createCylinder() {
      let positions = await getPublicData("data/provincePoint.json");
      for (let data of this.saleData) {
        data.position = positions[data.code];
        // data.sales = Number(data.sales);
        data.number = Number(data.number);
      }
      const maxSale = Math.max(
        ...this.saleData.map(item => {
          return item.sales;
        })
      );
      const maxHeight = 120;
      const heightScale = maxSale / maxHeight;
      console.log(this.saleData);
      console.log(heightScale);
      const glowCylinders = new GlowCylinder(
        this.saleData.slice(0, 10),
        maxHeight
      );
      // this.adjustModel(glowCylinders.mesh);
      // glowCylinders.mesh.rotation.x = Math.PI;
      glowCylinders.mesh.renderOrder = 4;
      console.log(glowCylinders.mesh);
      this.scene.add(glowCylinders.mesh);
    },
    addPickObject() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;

      const container = document.querySelector(".three-view");
      let popup = new Popup(this.scene, this.camera, container);
      console.log(popup);
      let labelRenderer = popup.getCSS2DRenderer();
      this.initControls(labelRenderer);
      labelRenderer.domElement.addEventListener("mousemove", onPointerMove);
      // this.renderer.domElement.addEventListener("mousemove", onPointerMove);
      that.selectedObjectOpacity = { opacity: 0 };
      const tween = new TWEEN.Tween(that.selectedObjectOpacity);
      function onPointerMove(event) {
        let mouse = new THREE.Vector2();
        if (event.isPrimary === false) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, that.camera);
        const intersects = raycaster.intersectObject(that.map, true);

        if (intersects.length > 0) {
          if (selectedObject && selectedObject !== intersects[0].object) {
            tween.stop();
            selectedObject.material.opacity = 0;
          }
          if (!selectedObject || selectedObject !== intersects[0].object) {
            selectedObject = intersects[0].object;
            that.selectedObject = selectedObject;
            tween
              .to({ opacity: 0.8 }, 500)
              .easing(TWEEN.Easing.Sinusoidal.InOut)
              .start();
            popup.addTo(selectedObject);
          }
        } else {
          if (selectedObject) {
            tween.stop();
            selectedObject.material.opacity = 0;
            popup.remove();
          }

          selectedObject = null;
          that.selectedObject = null;
        }
      }
    },
    adjustModel(model) {
      console.log(model.position);
      debugger;
      const box = new THREE.Box3().setFromObject(model);
      console.log(box);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x += model.position.x - center.x;
      model.position.y += model.position.y - center.y;
      model.position.z += model.position.z - center.z;
      console.log(model);

      //调整模型尺寸
      // model.scale.set(0.1, 0.1, 0.1);
      //调整模型中心
      // model.traverse(function(o) {
      //   if (o.isMesh) {
      //     // o.geometry.computeBoundingBox()
      //     o.geometry.center();
      //   }
      // });
    },
    addClickListener() {
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      // scene.background = new THREE.Color(0x333333);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;
      // renderer.sortObject = false
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        25.5,
        1920 / 872.72,
        -12000,
        1000
      );
      this.camera = camera;

      camera.position.set(
        433.4546738920335,
        1092.3373155675602,
        1871.1568469792544
      );
      // camera.position.set(0, 0, 2000);

      // 避免模型很模糊的现象
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
    addState() {
      let state = new Stats();
      this.state = state;
      const container = document.querySelector(".three-view");
      container.appendChild(state.dom);
    },
    initControls(renderer) {
      let controls;
      if (renderer) {
        controls = new OrbitControls(this.camera, renderer.domElement);
      } else {
        controls = new OrbitControls(this.camera, this.renderer.domElement);
      }
      controls.zoomSpeed = 0.5;
      controls.target.set(
        33.695560733839194,
        85.97554758245946,
        -34.2101401898482
      );
      this.controls = controls;
      // this.controls.enabled = false;
    },
    initLight() {
      this.initAmbientLight();
      // this.initPointLight()
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff", 1);
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.5);
      //光源位置
      dirLight.position.set(20, 40, 15);
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
      const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
      pointLight.position.set(50, 50, 0);
      this.scene.add(pointLight);
      // 显示阴影
      // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      TWEEN.update();
      if (this.selectedObject) {
        this.selectedObject.material.opacity = this.selectedObjectOpacity.opacity;
      }

      this.renderer.render(this.scene, this.camera);

      this.controls.update(this.clock.getDelta()); //TrackballControls

      const time = this.clock.getElapsedTime();
      if (this.refractor) {
        this.refractor.material.uniforms.time.value = time;
      }

      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  }
};
</script>

<style lang="scss">
#app {
  overflow: hidden;
}
.three-view {
  height: 872.72px;
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
}
</style>
