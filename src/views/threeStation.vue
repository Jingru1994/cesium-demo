<template>
  <div class="station-three-view">
    <div class="imageDiv">
      <img :src="imgUrl" width="100%" />
    </div>
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import * as TWEEN from "@tweenjs/tween.js";
import Popup from "@/utils/widgets/Popup3/Popup.js";
import SpreadCircle from "@/utils/widgets/SpreadCircle1/SpreadCircle.js";
import { getPublicData } from "@/api/requestData.js";
import exampleData from "@/utils/stationData.js";
import * as d3 from "d3-geo";

export default {
  name: "StationBigData",
  props: {
    year: {
      type: [String, Number],
      require: true
    }
  },
  data() {
    return {
      // videoUrl: "images/大屏.mp4",
      videoUrl: "images/background.mp4",
      autoPlay: true,
      imgUrl: "images/stationBackground.png",
      stationData: null
    };
  },
  created() {},
  async mounted() {
    this.clock = new THREE.Clock();
    this.handler = {};

    this.initScene();
    this.initControls();
    this.initLight();
    // this.drawMap();
    await this.queryData(this.year);
    this.addStation();
    this.createPopup();
    this.pickStation();
    this.createSpreadCircle();
    this.addClickListener();
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.labelRenderer.domElement.removeEventListener(
      "mousemove",
      this.onPointerMove("mousemove")
    );
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
    destroyStation() {
      this.labelRenderer.domElement.removeEventListener(
        "mousemove",
        this.onPointerMove("mousemove")
      );
      this.scene.remove(this.stations);
      this.stations.traverse(item => {
        if (item.isMesh || item.isSprite) {
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
      this.stations = null;
    },

    async queryData(year) {
      // let data = await queryStationList(year);
      // this.stationData = data;
      this.stationData = exampleData;
    },
    async addStation() {
      const projection = d3
        .geoMercator()
        .center([114.8415075, 44.263375499])
        .translate([0, 0])
        .reflectY(90);
      const group = new THREE.Group();
      for (const station of this.stationData) {
        let position = projection([station.x, station.y]);
        position = [...position, 0.02];
        let mesh = undefined;
        if (station.isCenter === "false") {
          mesh = this.createStationPoint(0.3);
        } else {
          mesh = this.createCenterPoint(0.25);
          mesh.traverse(item => {
            item.name = station.name;
            item.farmerNum = station.farmerNum;
            item.sales = station.sales;
            item.isCenter = station.isCenter;
          });
        }
        mesh.name = station.name;
        mesh.farmerNum = station.farmerNum;
        mesh.sales = station.sales;
        mesh.isCenter = station.isCenter;
        group.add(mesh);

        mesh.position.set(...position);
      }
      group.rotation.x = -Math.PI / 2;
      this.scene.add(group);
      this.stations = group;
    },
    createStationPoint(radius) {
      const geometry = new THREE.CircleGeometry(radius, 32);
      const uniforms = {
        color: {
          value: new THREE.Color("#E0FDFF")
        },
        glowColor: {
          value: new THREE.Color("#42F2FF")
        },
        radius: {
          value: radius
        }
      };
      const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fragmentShader = `
        varying vec3 vPosition;
        uniform vec3 color;
        uniform vec3 glowColor;
        uniform float radius;

        void main(){
            float dis = distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
            if(dis<radius*0.3){
                gl_FragColor = vec4(color,1.0);
            }else{
                float pct = (radius-dis)/radius;
                gl_FragColor = vec4(glowColor,pct*0.9);
            }
            // float pct = (radius-dis)/radius;
            //     gl_FragColor = vec4(glowColor,pct*0.8);
        
        }
      `;
      const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
      });

      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    },
    createCenterPoint(radius) {
      const innerCircleGeometry = new THREE.CircleGeometry(radius, 32);
      const innerCircleMaterial = new THREE.MeshBasicMaterial({
        color: "#F835FB"
      });
      const innerCircle = new THREE.Mesh(
        innerCircleGeometry,
        innerCircleMaterial
      );
      innerCircle.isCenterAttached = true;
      const outterCircleGeometry = new THREE.CircleGeometry(radius * 2.7, 32);
      const outterCircleMaterial = new THREE.MeshBasicMaterial({
        color: "#F835FB",
        transparent: true,
        opacity: 0.5
      });
      const outterCircle = new THREE.Mesh(
        outterCircleGeometry,
        outterCircleMaterial
      );
      outterCircle.isCenterAttached = true;
      const outlineGeometry = new THREE.RingGeometry(
        radius * 2.7,
        radius * 2.9,
        32
      );
      const outlineMaterial = new THREE.MeshBasicMaterial({ color: "#F835FB" });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.isCenterAttached = true;
      const texture = new THREE.TextureLoader().load(
        "images/centerStation.png"
      );
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });

      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 1.5);
      sprite.center.set(0.5, 0.2);
      const group = new THREE.Group();
      group.add(innerCircle, outterCircle, outline, sprite);
      return group;
    },
    createSpreadCircle() {
      const options1 = {
        radius: 0.8,
        color: "#1CF0FF",
        initRadius: 0.2,
        width: 0.2,
        duration: 2000
      };
      const stationSpreadCircle = new SpreadCircle(options1);
      stationSpreadCircle.mesh.visible = false;

      this.scene.add(stationSpreadCircle.mesh);
      stationSpreadCircle.mesh.rotation.x = -Math.PI / 2;
      this.stationSpreadCircle = stationSpreadCircle;

      const options2 = {
        radius: 1.6,
        color: "#F835FB",
        initRadius: 0.4,
        width: 0.5,
        duration: 2000
      };
      const centerSpreadCircle = new SpreadCircle(options2);
      centerSpreadCircle.mesh.visible = false;

      this.scene.add(centerSpreadCircle.mesh);
      stationSpreadCircle.mesh.rotation.x = -Math.PI / 2;
      this.centerSpreadCircle = centerSpreadCircle;
    },
    pickStation() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;

      this.labelRenderer.domElement.addEventListener(
        "mousemove",
        this.onPointerMove(
          "mousemove",
          that,
          raycaster,
          selectedObject,
          that.popup
        )
      );
    },
    createPopup() {
      const container = document.querySelector(".station-three-view");
      const popup = new Popup(this.scene, this.camera, container);
      const textContent = popup.getTextContent();
      const stationName = document.createElement("div");
      stationName.className = "stationName";
      textContent.appendChild(stationName);
      const farmerDiv = document.createElement("div");
      farmerDiv.className = "bottomDiv";
      textContent.appendChild(farmerDiv);
      const farmerField = document.createElement("div");
      farmerField.className = "text farmer field";
      farmerField.innerText = "覆盖农户";
      farmerDiv.appendChild(farmerField);
      const farmerNum = document.createElement("div");
      farmerNum.className = "text farmer value";
      farmerDiv.appendChild(farmerNum);
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
        stationName.innerText = object.name;
        farmerNum.innerText = object.farmerNum + "户";
        sales.innerText = object.sales + "万元";
      }
      popup.setAddCallback(callback);

      let labelRenderer = popup.getCSS2DRenderer();
      this.labelRenderer = labelRenderer;
      this.initControls(labelRenderer);
      this.popup = popup;
    },
    onPointerMove(index, that, raycaster, selectedObject, popup) {
      return (
        this.handler[index] ||
        (this.handler[index] = function(event) {
          let mouse = new THREE.Vector2();
          if (event.isPrimary === false) return;
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, that.camera);
          const intersects = raycaster.intersectObject(that.stations, true);
          if (intersects[0] && intersects[0].object.isCenterAttached) {
            return;
          }

          if (intersects.length > 0) {
            if (selectedObject && selectedObject !== intersects[0].object) {
              that.stationSpreadCircle.mesh.visible = false;
              that.centerSpreadCircle.mesh.visible = false;
            }
            if (!selectedObject || selectedObject !== intersects[0].object) {
              selectedObject = intersects[0].object;
              that.selectedObject = selectedObject;
              if (selectedObject.isCenter === "true") {
                that.centerSpreadCircle.mesh.position.set(
                  selectedObject.parent.position.x,
                  0,
                  -selectedObject.parent.position.y
                );
                that.centerSpreadCircle.tween.stop();
                that.centerSpreadCircle.tween.start();
                that.centerSpreadCircle.mesh.visible = true;
              } else {
                that.stationSpreadCircle.mesh.position.set(
                  selectedObject.position.x,
                  0,
                  -selectedObject.position.y
                );
                that.stationSpreadCircle.tween.stop();
                that.stationSpreadCircle.tween.start();
                that.stationSpreadCircle.mesh.visible = true;
              }

              popup.addTo(selectedObject);
            }
          } else {
            if (selectedObject) {
              that.stationSpreadCircle.mesh.visible = false;
              that.centerSpreadCircle.mesh.visible = false;
              popup.remove();
            }

            selectedObject = null;
            that.selectedObject = null;
          }
        })
      );
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async drawMap() {
      const group = new THREE.Group();
      let features = await this.getData("data/abaga.json");
      const center = this.computeFeaturesCenter(features);
      const projection = d3
        .geoMercator()
        .center(center)
        .translate([0, 0])
        .reflectY(90);
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinates => {
          coordinates.forEach(points => {
            let points_prj = [];
            points.forEach(point => {
              // let [x,y]
              points_prj.push(projection(point));
            });
            let item = this.drawMesh(this.drawShape(points_prj));
            group.add(item);
            group.rotation.x = -Math.PI / 2;
          });
        });
      });
      // group.scale = 10;
      this.scene.add(group);
      this.group = group;
    },
    computeFeaturesCenter(features) {
      let coordinateList = [];
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinate => {
          coordinate.forEach(points => {
            coordinateList.push(...points);
          });
        });
      });
      let xMax = Math.max(
        ...coordinateList.map(item => {
          return item[0];
        })
      );
      let xMin = Math.min(
        ...coordinateList.map(item => {
          return item[0];
        })
      );
      let yMax = Math.max(
        ...coordinateList.map(item => {
          return item[1];
        })
      );
      let yMin = Math.min(
        ...coordinateList.map(item => {
          return item[1];
        })
      );
      let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
      return center;
    },
    drawShape(posArr) {
      var shape = new THREE.Shape();
      shape.moveTo(posArr[0][0], posArr[0][1]);
      posArr.forEach(item => {
        shape.lineTo(item[0], item[1]);
      });
      return shape;
    },
    drawMesh(shape) {
      const geometry = new THREE.ShapeGeometry(shape);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
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
        0.1968355068442353,
        20.632412971484825,
        23.334708655312443
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
        0.3750292456186922,
        -1.7025306892946315,
        0.6468436841611216
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

      this.renderer.render(this.scene, this.camera);
      if (this.controls) {
        this.controls.update(this.clock.getDelta()); //TrackballControls
      }

      // const time = this.clock.getElapsedTime();

      this.myAnimate = requestAnimationFrame(this.animate);
    },
    onWindowResize() {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  },
  watch: {
    year: {
      handler: async function(val, oldVal) {
        console.log("val", val);
        console.log("oldVal", oldVal);
        await this.queryData();
        this.destroyStation();
        this.addStation();
        this.pickStation();
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
.station-three-view {
  height: 872.72px;
  #three {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .imageDiv {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .three-popup-label {
    height: 184px;
  }
  .three-popup-label .three-popup-label-line.hover {
    width: 38px;
    height: 100px;
  }
  .stationName {
    font-weight: bold;
    font-size: 18px;
    height: 18px;
    color: #5df5a0;
    margin-bottom: 18px;
    text-align: start;
  }
}
</style>
