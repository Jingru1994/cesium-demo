<template>
  <div class="three-view">
    <div class="videoDiv">
      <!-- <img :src="imgUrl" width="100%" /> -->
      <video id="myVideo" muted :autoplay="true" width="100%">
        <source :src="videoUrl" type="video/mp4" />
      </video>
    </div>
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

import * as TWEEN from "@tweenjs/tween.js";
import Popup from "@/utils/widgets/Popup3/Popup.js";
import GlowCylinder from "@/utils/widgets/GlowCylinder/GlowCylinder.js";
import { getPublicData } from "@/api/requestData.js";
import exampleData from "@/utils/saleData.js";

export default {
  name: "ThreeTerrain",
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
    this.initLight();
    this.saleData = this.saleList;
    await this.loadSvg();
    this.createCylinder(3250, 4000);
    this.createPopup();
    this.cameraAnimate();
    // this.addClickListener();
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    window.removeEventListener("mousemove", this.onPointerMove("mousemove"));
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
    loadSvg() {
      const p = new Promise(resolve => {
        const loader = new SVGLoader();
        loader.load(
          // resource URL
          "data/china.svg",
          // called when the resource is loaded
          data => {
            const paths = data.paths;
            const group = new THREE.Group();

            for (let i = 0; i < paths.length; i++) {
              const path = paths[i];
              const shapes = SVGLoader.createShapes(path);
              const material = new THREE.MeshBasicMaterial({
                color: 0x19bf9e,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.0
              });

              for (let j = 0; j < shapes.length; j++) {
                const shape = shapes[j];
                const geometry = new THREE.ShapeGeometry(shape);
                const mesh = new THREE.Mesh(geometry, material);
                const data = this.saleData.find(
                  element => element.code === path.userData.node.id
                );
                mesh.code = path.userData.node.id;
                mesh.name = data.name;
                mesh.number = data.number;
                mesh.orderNum = data.orderNum;
                mesh.sales = data.sales;
                // mesh.renderOrder = 0;
                group.add(mesh);
              }
            }
            group.rotation.x = Math.PI / 2;
            this.adjustModel(group);

            this.scene.add(group);
            this.map = group;
            console.log(this.map);
            resolve(group);
          },
          xhr => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          error => {
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
    },
    async createCylinder(delay1, delay2) {
      let positions = await getPublicData("data/provincePoint.json");
      for (let data of this.saleData) {
        data.position = positions[data.code];
        // data.sales = Number(data.sales);
        data.number = Number(data.number);
      }
      const maxHeight = 120;
      const glowCylinders = new GlowCylinder(
        this.saleData.slice(0, 10),
        // this.saleData,
        maxHeight,
        delay1,
        delay2
      );
      this.scene.add(glowCylinders.mesh);
      this.scene.add(glowCylinders.label);
      this.glowCylinders = glowCylinders;
    },
    pickCylinder() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;

      that.selectedObjectOpacity = { opacity: 0 };
      const tween = new TWEEN.Tween(that.selectedObjectOpacity);
      this.labelRenderer.domElement.addEventListener(
        "mousemove",
        this.onPointerMove(
          "mousemove",
          that,
          raycaster,
          tween,
          selectedObject,
          that.popup
        )
      );
    },
    createPopup() {
      const container = document.querySelector(".three-view");
      const popup = new Popup(this.scene, this.camera, container);
      const textContent = popup.getTextContent();
      const topDiv = document.createElement("div");
      topDiv.className = "topDiv";
      textContent.appendChild(topDiv);
      const province = document.createElement("div");
      province.className = "text province";
      topDiv.appendChild(province);
      const number = document.createElement("div");
      number.className = "text number ";
      topDiv.appendChild(number);
      const orderDiv = document.createElement("div");
      orderDiv.className = "bottomDiv";
      textContent.appendChild(orderDiv);
      const orderField = document.createElement("div");
      orderField.className = "text orderNum field";
      orderField.innerText = "订单数量";
      orderDiv.appendChild(orderField);
      const orderNum = document.createElement("div");
      orderNum.className = "text orderNum value";
      orderDiv.appendChild(orderNum);
      const salesDiv = document.createElement("div");
      salesDiv.className = "bottomDiv";
      textContent.appendChild(salesDiv);
      const salesField = document.createElement("div");
      salesField.className = "text sales field";
      salesField.innerText = "销售额";
      salesDiv.appendChild(salesField);
      const sales = document.createElement("div");
      sales.className = "text sales value";
      salesDiv.appendChild(sales);

      function callback(object) {
        province.innerText = object.name;
        number.innerText = "TOP " + object.number;
        orderNum.innerText = object.orderNum + "万笔";
        sales.innerText = object.sales + "万元";
      }
      popup.setAddCallback(callback);

      let labelRenderer = popup.getCSS2DRenderer();
      this.labelRenderer = labelRenderer;
      this.initControls(labelRenderer);
      this.popup = popup;
    },
    onPointerMove(index, that, raycaster, tween, selectedObject, popup) {
      return (
        this.handler[index] ||
        (this.handler[index] = function(event) {
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
        })
      );
    },
    assignMapData() {
      console.log(this.map);
      for (const item of this.map.children) {
        const data = this.saleData.find(element => element.code === item.code);
        item.number = data.number;
        item.sales = data.sales;
        item.orderNum = data.orderNum;
      }
    },
    destroyCylinder() {
      this.scene.remove(this.glowCylinders.mesh);
      this.scene.remove(this.glowCylinders.label);
      this.glowCylinders.mesh.traverse(item => {
        if (item.isMesh) {
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
      this.glowCylinders.label.traverse(item => {
        if (item.isSprite) {
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
    },
    adjustModel(model) {
      console.log(model.position);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x += model.position.x - center.x;
      model.position.y += model.position.y - center.y;
      model.position.z += model.position.z - center.z;

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
    cameraAnimate() {
      const tween = new TWEEN.Tween({
        x: 708.569373736083,
        y: 1293.2483716584538,
        z: 1936.7612571467962
      });
      tween
        .to(
          {
            x: 435.49052266841977,
            y: 1093.8240573808364,
            z: 1871.6423196139076
          },
          1400
        )
        .onComplete(() => {
          this.pickCylinder();
        })
        .onUpdate(p => {
          if (p.x < 951.04) {
            this.camera.position.set(p.x, p.y, p.z);
          }
        })
        .easing(TWEEN.Easing.Quadratic.Out)
        .onStart(() => {
          new TWEEN.Tween({
            x: 58.39330816859741,
            y: 112.74491116323573,
            z: -53.401049659041696
          })
            .to(
              {
                x: 33.774593525336,
                y: 86.06120954559883,
                z: -34.27155109992084
              },
              1400
            )
            .onUpdate(p => {
              if (p.x > 33.7745) {
                this.controls.target.set(p.x, p.y, p.z);
              }
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
        })
        .delay(3250)
        .start();
    },
    addClickListener() {
      this.labelRenderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
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
      camera.position.set(
        708.569373736083,
        1293.2483716584538,
        1936.7612571467962
      );
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

      controls.target.set(
        58.39330816859741,
        112.74491116323573,
        -53.401049659041696
      );

      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff", 1);
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.1);
      //光源位置
      dirLight.position.set(0, 1000, 0);
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
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      TWEEN.update();
      if (this.selectedObject) {
        this.selectedObject.material.opacity = this.selectedObjectOpacity.opacity;
      }

      this.renderer.render(this.scene, this.camera);
      if (this.controls) {
        this.controls.update(this.clock.getDelta()); //TrackballControls
      }

      // const time = this.clock.getElapsedTime();

      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  },
  watch: {
    saleList: {
      handler: function(val, oldVal) {
        console.log("val", val);
        console.log("oldVal", oldVal);
        this.assignMapData();
        this.destroyCylinder();
        this.createCylinder();
      },
      deep: true
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
