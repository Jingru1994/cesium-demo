<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import * as d3 from "d3";
import * as TWEEN from "@tweenjs/tween.js";
import Pyramid from "@/utils/widgets/Pyramid/Pyramid.js";
import SemiRing from "@/utils/widgets/SemiRing/SemiRing.js";
import DashArc from "@/utils/widgets/DashArc/DashArc.js";
// const d3 = Object.assign({}, require("d3-selection"), require("d3-geo"), require("d3-path"));

export default {
  name: "ThreeMacroScene",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.interval = 0;
    this.depth = 0.5; //拉伸地图的厚度
    this.clock = new THREE.Clock();

    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();

    await this.drawMap();
    this.addPickObject();

    this.addPath();
    this.createPlaneTexts();
    this.pathTwinkle();
    this.createPyramid();

    this.createSemiRing();
    this.createDashArc();
    this.addClickListener();
    this.cameraAnimate();

    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.pyramid.stop();
    this.semiRing1.stop();
    this.semiRing2.stop();
    this.semiRing3.stop();
    this.dashArc1.stop();
    this.dashArc2.stop();
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
    addClickListener() {
      this.renderer.domElement.addEventListener("click", () => {
        console.log(this.camera);
        console.log(this.controls);
      });
    },
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      scene.background = new THREE.Color(0x000000);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      this.camera = camera;

      //调整camera视角
      // camera.position.set(28.169150594032807, 21.425927942499733, 60.498411224479966)
      camera.up.set(1, 1, 0);
      camera.position.set(0, 0, 20);

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
        // controls = new OrbitControls(this.camera, renderer.domElement)
        controls = new TrackballControls(this.camera, renderer.domElement);
      } else {
        // controls = new OrbitControls(this.camera, this.renderer.domElement)
        controls = new TrackballControls(this.camera, this.renderer.domElement);
      }
      //OrbitControls参数设置
      //controls.enableDamping = true
      //TrackballControls参数设置
      controls.target.set(20, 20, 0);
      controls.rotateSpeed = 2.0;
      controls.zoomSpeed = 2.0;
      controls.panSpeed = 1.0;
      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      this.initDirectionalLight();
    },
    initAmbientLight() {
      //环境光
      const ambientLight = new THREE.AmbientLight("#ffffff");
      this.scene.add(ambientLight);
    },
    initDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.2);
      //光源位置
      dirLight.position.set(40, -47, -58);

      // dirLight.target = this.target
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -10;
      dirLight.shadow.camera.right = 10;
      dirLight.shadow.camera.top = 10;
      dirLight.shadow.camera.bottom = -10;
      this.dirLight = dirLight;
      this.scene.add(dirLight);
      //显示灯光范围
      // const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      this.renderer.render(this.scene, this.camera);
      // this.composer.render(this.clock.getDelta())//后处理

      // this.controls.update()//OrbitControls
      this.controls.update(this.clock.getDelta()); //TrackballControls

      TWEEN.update();

      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);
    },
    resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      var width = window.innerWidth;
      var height = window.innerHeight;
      var canvasPixelWidth = canvas.width / window.devicePixelRatio;
      var canvasPixelHeight = canvas.height / window.devicePixelRatio;

      const needResize =
        canvasPixelWidth !== width || canvasPixelHeight !== height;
      if (needResize) {
        this.renderer.setSize(width, height, false);
      }
      return needResize;
    },
    onWindowResize() {
      // this.composer.setSize( window.innerWidth, window.innerHeight )
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async drawMap() {
      await this.drawExtrudeMap();
    },
    async drawExtrudeMap() {
      const group = new THREE.Group();
      const lineGroup = new THREE.Group();
      let features = await this.getData("data/beijing_area.geojson");

      this.center = this.computeFeaturesCenter(features);
      let color = "#2E2D39";
      features.forEach(feature => {
        feature.geometry.coordinates.forEach(coordinate => {
          coordinate.forEach(points => {
            let points_prj = [];
            points.forEach(point => {
              points_prj.push(this.projection(point, this.center));
            });
            let item = this.drawExtrude(this.drawShape(points_prj));
            item.label = feature.properties.name;

            this.reMapUv(item.geometry);

            color = "#1A1A1A";
            if (
              feature.properties.NAME === "东城区" ||
              feature.properties.NAME === "西城区"
            ) {
              color = "#D7221D";
            }
            let line1 = this.drawLine(points_prj, color, this.depth + 0.001);
            let line2 = this.drawLine(points_prj, color, -0.001);
            lineGroup.add(line1, line2);
            group.add(item);
          });
        });
      });
      this.target = group;
      this.group = group;
      this.scene.add(group);
      this.scene.add(lineGroup);
    },
    drawShape(posArr) {
      var shape = new THREE.Shape();
      shape.moveTo(posArr[0][0], posArr[0][1]);
      posArr.forEach(item => {
        shape.lineTo(item[0], item[1]);
      });
      return shape;
    },
    drawExtrude(shapeObj) {
      const extrudeSettings = {
        steps: 2,
        depth: this.depth,
        bevelEnabled: false
      };
      let geometry = new THREE.ExtrudeGeometry(shapeObj, extrudeSettings);

      let material1 = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgba(120,122,131,1)"),
        specular: new THREE.Color("rgba(100,100,100,1)"),
        shininess: 15.0
      });
      let material2 = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgba(20,20,20,1)"),
        specular: new THREE.Color("rgba(100,100,100,1)"),
        shininess: 20.0
      });
      let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
      // shapeGeometryObj.position = geometry.boundingSphere.center
      // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
      shapeGeometryObj.name = "board";
      return shapeGeometryObj;
    },
    drawLine(posArr, color, z) {
      let geometry = new LineGeometry();
      let vertices = [];
      posArr.forEach(item => {
        vertices.push(item[0]);
        vertices.push(item[1]);
        vertices.push(z);
      });
      geometry.setPositions(vertices);
      let lineMaterial = new LineMaterial({
        color: new THREE.Color(color),
        linewidth: 2.5,
        transparent: true,
        opacity: 0.7
      });
      lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
      let line = new Line2(geometry, lineMaterial);
      line.name = "line";
      return line;
    },
    reMapUv(geometry) {
      geometry.computeBoundingBox();
      const max = geometry.boundingBox.max;
      const min = geometry.boundingBox.min;
      const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
      const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
      const uvArray = geometry.getAttribute("uv");
      for (let i = 0; i < uvArray.array.length; i++) {
        uvArray.array[i] =
          i % 2
            ? (uvArray.array[i] + offset.y) / range.y
            : (uvArray.array[i] + offset.x) / range.x;
      }
      geometry.setAttribute("uv", uvArray);
    },
    projection(point, center) {
      const projection = d3
        .geoMercator()
        .center(center)
        .translate([0, 0])
        .reflectY(90)
        .scale(1000);
      // const projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]).reflectY(90)
      // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
      return projection(point);
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
      //计算最值的另一种方法
      // let xMax1 = coordinateList.sort((a,b) => { return b[0]-a[0]})[0][0]
      // let xMin1 = coordinateList.sort((a,b) => { return a[0]-b[0]})[0][0]
      let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
      return center;
    },
    addPickObject() {
      const that = this;
      const raycaster = new THREE.Raycaster();
      let selectedObject;
      //   const container = document.querySelector(".three-view");
      this.renderer.domElement.addEventListener("mousemove", onPointerMove);
      // labelRenderer.domElement.addEventListener('mousemove',onPointerMove)
      function onPointerMove(event) {
        let mouse = new THREE.Vector2();
        if (event.isPrimary === false) return;
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, that.camera);
        const intersects = raycaster.intersectObject(that.group, true);

        if (intersects.length > 0) {
          if (selectedObject && selectedObject !== intersects[0].object) {
            selectedObject.material[0].color.set(selectedObject.currentColor1);
            selectedObject.material[1].color.set(selectedObject.currentColor2);
          }
          if (!selectedObject || selectedObject !== intersects[0].object) {
            selectedObject = intersects[0].object;
            selectedObject.currentColor1 = selectedObject.material[0].color.getStyle();
            selectedObject.currentColor2 = selectedObject.material[1].color.getStyle();
            selectedObject.material[0].color.set("#9ACCD0");
            selectedObject.material[1].color.set("#17292B");
            // selectedObject.position.set(selectedObject.geometry.boundingSphere.center)
          }
        } else {
          if (selectedObject) {
            selectedObject.material[0].color.set(selectedObject.currentColor1);
            selectedObject.material[1].color.set(selectedObject.currentColor2);
          }

          selectedObject = null;
        }
      }
    },
    pathTwinkle() {
      const that = this;
      setTimeout(function() {
        let n = 1;
        Object.values(that.groupList).forEach(function(item) {
          setTimeout(function() {
            let m = 0;
            const interval = setInterval(function() {
              if (item.visible === true) {
                item.visible = false;
              } else {
                item.visible = true;
              }

              if (m === 5) {
                clearInterval(interval);
              }
              m++;
            }, 1000);
          }, 7000 * n);
          n++;
        });
      }, 1000);
    },
    async createPlaneTexts() {
      let bj_point = await this.getData("data/beijing_point.geojson");
      let bj_a_point = await this.getData("data/beijing_around_point.geojson");
      let bj_a_point1 = await this.getData(
        "data/beijing_around_point1.geojson"
      );
      const that = this;

      const loader = new FontLoader();
      loader.load("threeFonts/Microsoft YaHei_Bold.json", function(font) {
        bj_point.forEach(function(item) {
          let text = item.properties.NAME;
          let position = that.projection(
            item.geometry.coordinates,
            that.center
          );
          position = new THREE.Vector3(
            position[0],
            position[1],
            that.depth + 0.05
          );
          const geometry = new TextGeometry(text, {
            font: font,
            size: 0.45,
            height: 0.01,
            bevelEnabled: false
          });
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#fff")
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          that.scene.add(mesh);
        });
        bj_a_point.forEach(function(item) {
          let text = item.properties.NAME;
          let position = that.projection(
            item.geometry.coordinates,
            that.center
          );
          position = new THREE.Vector3(
            position[0],
            position[1],
            that.depth + 0.05
          );
          const geometry = new TextGeometry(text, {
            font: font,
            size: 0.45,
            height: 0.01,
            bevelEnabled: false
          });
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#DFBA83")
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          that.groupList[item.properties.Id].add(mesh);
          // that.scene.add(mesh)
        });
        bj_a_point1.forEach(function(item) {
          let text = item.properties.NAME;
          let position = that.projection(
            item.geometry.coordinates,
            that.center
          );
          position = new THREE.Vector3(
            position[0],
            position[1],
            that.depth + 0.05
          );
          const geometry = new TextGeometry(text, {
            font: font,
            size: 0.8,
            height: 0.01,
            bevelEnabled: false
          });
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#fff"),
            transparent: true,
            opacity: 0.5
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          that.scene.add(mesh);
        });
      });
    },
    async addPath() {
      let features = await this.getData("data/beijing_around_line.geojson");
      let groupList = {};
      this.groupList = groupList;
      features.forEach(feature => {
        let id = feature.properties.Id;
        let group = new THREE.Group();
        this.scene.add(group);
        groupList[id] = group;
        feature.geometry.coordinates.forEach(points => {
          let points_prj = [];
          points.forEach(point => {
            points_prj.push(this.projection(point, this.center));
          });

          let geometry = new THREE.BufferGeometry();
          let vertices = [];
          points_prj.forEach(item => {
            vertices.push(item[0]);
            vertices.push(item[1]);
            vertices.push(this.depth + 0.01);
          });
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
          );

          let lineMaterial = new THREE.LineDashedMaterial({
            color: new THREE.Color("#DFBA83"),
            dashSize: 0.5,
            gapSize: 0.5
          });
          let line = new THREE.Line(geometry, lineMaterial);
          line.computeLineDistances();
          group.add(line);
          // this.scene.add(line)
        });
      });
    },
    createPyramid() {
      let options = {
        speed: -0.01,
        position: new THREE.Vector3(-1.5, -8, this.depth + 0.1)
      };
      let pyramid = new Pyramid(options);
      this.pyramid = pyramid;
      this.scene.add(pyramid.mesh);
    },
    createSemiRing() {
      const position = new THREE.Vector3(0, 0, -0.02);
      const options1 = {
        splitPoint: 0.2,
        speed: +0.011,
        position: position,
        scale: 0.9
      };
      const semiRing1 = new SemiRing(options1);
      semiRing1.mesh.rotation.z = Math.PI;
      const options2 = {
        splitPoint: 0.2,
        speed: +0.01,
        position: position,
        scale: 1.4
      };
      const semiRing2 = new SemiRing(options2);
      const options3 = {
        splitPoint: 0.2,
        speed: -0.01,
        position: position,
        scale: 2.3
      };
      const semiRing3 = new SemiRing(options3);
      this.semiRing1 = semiRing1;
      this.semiRing2 = semiRing2;
      this.semiRing3 = semiRing3;
      this.scene.add(semiRing1.mesh, semiRing2.mesh, semiRing3.mesh);
    },
    createDashArc() {
      const options1 = {
        radius: 37,
        speed: 0.005
      };
      const dashArc1 = new DashArc(options1);
      dashArc1.mesh.rotation.x = Math.PI * 0.05;
      this.dashArc1 = dashArc1;
      this.scene.add(dashArc1.mesh);
      const options2 = {
        radius: 41,
        dotRadius: 2,
        speed: 0.005
      };
      const dashArc2 = new DashArc(options2);
      this.dashArc2 = dashArc2;
      dashArc2.mesh.rotation.x = Math.PI * 0.05;
      this.scene.add(dashArc2.mesh);
    },

    cameraAnimate() {
      //链式调用，不需要一层层回调
      const that = this;

      const tween1 = new TWEEN.Tween(that.camera.position)
        .to(
          {
            x: -1.0493631936711687,
            y: -29.358201570979084,
            z: 52.09326057994469
          },
          3000
        )
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
        .onStart(function() {
          new TWEEN.Tween(that.controls.target)
            .to({ x: 0, y: 0, z: 0 }, 3000)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

          new TWEEN.Tween(that.camera.up)
            .to(
              {
                x: 0.007621264325026406,
                y: 0.8710859452842911,
                z: 0.4910714736758848
              },
              3000
            )
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();
        });

      const tween2 = new TWEEN.Tween(that.camera.position)
        .to(
          {
            x: 1.6735007558691362,
            y: -28.493322112282893,
            z: 36.596767504833366
          },
          1000
        )
        .delay(500)
        .onStart(function() {
          new TWEEN.Tween(that.camera.up).to(
            {
              x: 0.007572834442687712,
              y: 0.7891925444386724,
              z: 0.6140991613582126
            },
            1000
          );
        });
      tween1.chain(tween2);

      // const arc = new THREE.EllipseCurve(
      //     50,0,
      //     50,50,
      //     Math.PI*5/4, Math.PI,
      //     true
      // )
      // const tween = new TWEEN.Tween({ t: 0 })
      // tween.to({ t: 1 }, 2000);
      // tween.onUpdate(({ t }) => {
      //     const position = arc.getPoint(t)
      //     console.log(position)
      //     that.controls.target.set(position.x, position.y, 0)

      // })
    }
  }
};
</script>

<style lang="scss">
#app {
  overflow: hidden;
}
.three-view {
  #three {
    width: 100%;
    height: 100%;
  }
}
</style>
