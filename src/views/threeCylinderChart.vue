<template>
  <div class="three-view">
    <div class="operation-panel">
      <el-radio v-model="switchPopup" label="open">打开弹窗</el-radio>
      <el-radio v-model="switchPopup" label="close">关闭弹窗</el-radio>
    </div>
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";

import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// import * as d3 from 'd3'
const d3 = Object.assign(
  {},
  require("d3-scale"),
  require("d3-geo"),
  require("d3-array")
);

import CylinderChart from "@/utils/widgets/CylinderChart/CylinderChart.js";

// var TWEEN = require('@tweenjs/tween.js');

export default {
  name: "ThreeCylinderChart",
  data() {
    return {
      switchPopup: "open"
    };
  },
  created() {},
  watch: {
    switchPopup: {
      handler(newVal) {
        if (newVal === "open") {
          this.cylinderChart.openPopup();
        } else {
          this.cylinderChart.closePopup();
        }
      }
    }
  },
  async mounted() {
    // this.offsetX = -110 //直接使用经纬度绘制时的位移
    // this.offsetY = -30
    this.depth = 2; //拉伸地图的厚度
    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();
    await this.drawMap();

    this.addCylinderChart();
    this.animate();
  },
  beforeDestroy() {
    console.log(this.myAnimate);
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.cylinderChart.stop();
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
    initScene() {
      const scene = new THREE.Scene();
      this.scene = scene;
      // scene.background = new THREE.Color('rgba(255,255,255,1)')
      scene.background = new THREE.Color("#041336");
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      this.camera = camera;
      camera.position.set(0, -170, 120); //camera默认放在中心点(0,0,0)，挪一下位置

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
      this.controls = controls;
      controls.enableDamping = true;
    },
    initLight() {
      this.initAmbientLight();
      this.initPointLight();
      // this.initDirectionalLight()
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
      dirLight.position.set(0, 0, 100);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
      console.log(dirLight.target);
      dirLight.shadow.camera.near = 100;
      dirLight.shadow.camera.far = 300;
      dirLight.shadow.camera.left = -40;
      dirLight.shadow.camera.right = 40;
      dirLight.shadow.camera.top = 40;
      dirLight.shadow.camera.bottom = -50;
      this.scene.add(dirLight);
      //显示阴影
      const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera);
      this.scene.add(debugCamera);
    },
    initPointLight() {
      const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
      pointLight.position.set(0, 0, 150);
      this.scene.add(pointLight);
      // 显示阴影
      // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
      // this.scene.add(debugCamera)
    },
    animate() {
      //three需要动画循环函数，每一帧都执行这个函数
      this.controls.update();
      // trackballControls.update(clock.getDelta());
      this.renderer.render(this.scene, this.camera);
      this.state.update();
      this.myAnimate = requestAnimationFrame(this.animate);
      // TWEEN.update()//tween要想完成动态效果需要在主函数中调用TWEEN.update(),
      //在页面中并没有使用tween，让ODLine动起来应该放在ODLine类里，放在这里感觉类和业务代码耦合了，用ODLine.animate()替代了
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
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async drawMap() {
      const group = new THREE.Group();
      const lineGroup = new THREE.Group();
      let chinaGeometry = await this.getData("data/china.json");
      chinaGeometry.forEach(province => {
        province.geometry.coordinates.forEach(provinceChild => {
          provinceChild.forEach(points => {
            let points_prj = [];
            points.forEach(point => {
              // let [x,y]
              points_prj.push(this.projection(point));
            });
            let item = this.drawExtrude(this.drawShape(points_prj));
            item.label = province.properties.name;
            let lines = this.drawLine(points_prj);
            lines.forEach(line => {
              lineGroup.add(line);
            });
            // console.log(item.geometry.boundingSphere.radius)
            group.add(item);
          });
        });
      });
      this.scene.add(group);
      this.scene.add(lineGroup);
      this.lineGroup = lineGroup;
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
        color: new THREE.Color("#161E32"),
        specular: new THREE.Color("#334676"),
        // specular: 0x111111,
        shininess: 32.0
      });
      let material2 = new THREE.MeshBasicMaterial({
        color: 0x008bfb
      });
      let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2]);
      // shapeGeometryObj.position = geometry.boundingSphere.center
      // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
      shapeGeometryObj.name = "board";
      return shapeGeometryObj;
    },
    drawLine(posArr) {
      let geometry1 = new THREE.BufferGeometry();
      let geometry2 = new THREE.BufferGeometry();
      let verticesList1 = [];
      let verticesList2 = [];
      posArr.forEach(item => {
        verticesList1.push(item[0]);
        verticesList1.push(item[1]);
        verticesList1.push(this.depth);
        verticesList2.push(item[0]);
        verticesList2.push(item[1]);
        verticesList2.push(-0.001);
      });
      const vertices1 = new Float32Array(verticesList1);
      const vertices2 = new Float32Array(verticesList2);
      geometry1.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices1, 3)
      );
      geometry2.setAttribute(
        "position",
        new THREE.BufferAttribute(vertices2, 3)
      );
      let lineMaterial = new THREE.LineBasicMaterial({ color: 0x008bfb });
      let line1 = new THREE.Line(geometry1, lineMaterial);
      let line2 = new THREE.Line(geometry2, lineMaterial);
      line1.name = "line";
      line2.name = "line";
      return [line1, line2];
    },
    projection(point) {
      const projection = d3
        .geoMercator()
        .center([104.0, 37.5])
        .translate([0, 0])
        .reflectY(90);
      // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
      return projection(point);
    },
    async addCylinderChart() {
      //   const group = new THREE.Group();
      let data = await this.getData("data/gdp2020.geojson");
      const projection = d3
        .geoMercator()
        .center([104.0, 37.5])
        .translate([0, 0])
        .reflectY(90);
      for (let i = 0; i < data.length; i++) {
        let coordinate = projection(data[i].geometry.coordinates);
        data[i].geometry.coordinates = coordinate;

        // let data1 = [
        //     {name:'第一产业', value: data[i].properties.primary, color:'#478BD5'},
        //     {name:'第二产业', value: data[i].properties.secondary, color:'#DEC23A'},
        //     {name:'第三产业', value: data[i].properties.Tertiary, color:'#E47B28'}
        // ]
        // let html = `${data[i].properties.NAME}(三次产业/亿元)<br/>
        //     <div style="height: 30px; line-height:30px;"><span style="color:#478BD5; font-size:20px">&#9679</span><span></span>第一产业：${data[i].properties.primary}</span></div>
        //     <div style="height: 30px; line-height:30px;"><span style="color:#DEC23A; font-size:20px">&#9679</span><span></span>第二产业：${data[i].properties.secondary}</span></div>
        //     <div style="height: 30px; line-height:30px;"><span style="color:#E47B28; font-size:20px">&#9679</span><span></span>第三产业：${data[i].properties.Tertiary}</span></div>`
        // let canvas = this.createTexture(data1)
        // const texture = new THREE.CanvasTexture(canvas)
        // const material = new THREE.MeshPhongMaterial({map: texture})
        // const matetialBottom = new THREE.MeshPhongMaterial({color: '#E47B28'})
        // const matetialTop = new THREE.MeshPhongMaterial({color: '#478BD5'})
        // let height = data[i].properties.GDP/5000
        // console.log(height)
        // const geometry = new THREE.CylinderGeometry(1.2,1.2,height,32)
        // const mesh = new THREE.Mesh(geometry,[material,matetialBottom,matetialTop])
        // mesh.rotation.x = Math.PI/2
        // mesh.position.set(coordinate[0],coordinate[1], this.depth+height/2)
        // mesh.html = html
        // mesh.type = 'cylinder'
        // // this.scene.add(mesh)
        // group.add(mesh)
        // console.log(mesh)
      }
      const container = document.querySelector(".three-view");
      let options = {
        data: data,
        dataSeries: [
          { alias: "第一产业", name: "primary", color: "#478BD5" },
          { alias: "第二产业", name: "secondary", color: "#DEC23A" },
          { alias: "第三产业", name: "Tertiary", color: "#E47B28" }
        ],
        title: {
          name: "NAME",
          unit: "三次产业/亿元"
        },
        scene: this.scene,
        camera: this.camera,
        container: container,
        offset: [0, 0, this.depth],
        legendOffset: [18, 0, 0],
        legendPanelColor: "#0D215C",
        cylinderRadius: 1.2,
        cylinderHeightScale: 1 / 5000,
        animateDuration: 1500
      };
      let cylinderChart = new CylinderChart(options);
      cylinderChart.openPopup();
      this.scene.add(cylinderChart.mesh);
      this.cylinderChart = cylinderChart;
    },
    closePopup() {
      console.log("1");
      this.cylinderChart.closePopup();
    },
    openPopup() {
      console.log("1");
      this.cylinderChart.openPopup();
    },
    createTexture(data) {
      const canvas = document.createElement("canvas");
      canvas.height = 500;
      canvas.width = 1;
      const y = d3
        .scalePow()
        .rangeRound([0, 500]) //与 canvas的height保持一致
        .domain([0, d3.sum(data.map(({ value }) => value))]);
      const ctx = canvas.getContext("2d");
      let left = 0;
      data.forEach(item => {
        const current = y(item.value);
        ctx.moveTo(0.5, 500 - left); //与 canvas的height保持一致
        ctx.lineTo(0.5, 500 - (left + current));
        left += current;
        ctx.lineWidth = 1;
        ctx.strokeStyle = item.color;
        ctx.stroke();
        ctx.beginPath();
      });

      return canvas;
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
  .operation-panel {
    position: fixed;
    top: 20px;
    left: 100px;
    padding: 10px 20px;
    background-color: #ffffff;
    border-radius: 4px;
    z-index: 1;
  }
}
</style>
