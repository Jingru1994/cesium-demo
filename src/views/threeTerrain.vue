<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// import DistrictTerrain from "@/utils/widgets/Terrain/DistrictTerrain.js";
import DistrictTerrain from "@/utils/widgets/Terrain/DistrictTerrain2.js";
import { getPublicData } from "@/api/requestData.js";
import * as d3 from "d3-geo";

export default {
  name: "ThreeTerrain",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.clock = new THREE.Clock();

    this.initScene();
    this.addState();
    this.initControls();
    this.initLight();
    console.log(this.scene);

    // this.addTerrain();
    this.addTerrain1();
    // const geometry = new THREE.BoxGeometry(5, 5, 5);
    // const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // this.scene.add(cube);

    this.addClickListener();

    let GUI = document.querySelector(".dg.main.a");
    if (GUI) {
      GUI.remove(); //不删除的话，每次保存时都会多出一个控制面板
    }
    this.animate();
  },
  beforeDestroy() {
    cancelAnimationFrame(this.myAnimate);
    window.removeEventListener("resize", this.onWindowResize);
    this.scene.traverse((item) => {
      if (item.isMesh || item instanceof THREE.Sprite) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach((material) => {
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
      scene.background = new THREE.Color(0x333333);
      scene.fog = new THREE.Fog(0x04613b, 10, 100);
      const canvas = document.querySelector("#three");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      this.renderer = renderer;
      renderer.shadowMap.enabled = true;
      renderer.autoClear = false;
      // renderer.sortObject = false
      //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
      const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
      );
      this.camera = camera;

      //调整camera视角
      camera.position.set(
        -4.025961174328703,
        64.68049465988572,
        91.83877121577603
      );

      console.log(camera);

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
      controls.target.set(
        -1.7073951515135204,
        -12.370792980039933,
        3.121498692070242
      );
      this.controls = controls;
    },
    initLight() {
      this.initAmbientLight();
      // this.initPointLight();
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
      var debugCamera1 = new THREE.DirectionalLightHelper(dirLight);
      this.scene.add(debugCamera1);
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
    },
    async getData(url) {
      let data = await getPublicData(url);
      return data.features;
    },
    async addTerrain1() {
      const features = await this.getData("data/beijing.geojson");
      const center = this.computeFeaturesCenter(features);
      features.forEach((feature) => {
        feature.geometry.coordinates.forEach((child) => {
          child.forEach((points) => {
            points.forEach((point) => {
              [point[0], point[1]] = this.projection(point, center, 1000);
            });
          });
        });
      });
      const heightTexture = new THREE.TextureLoader().load(
        "images/rs/beijing_dem6.png"
      );
      console.log(heightTexture);
      const diffuseTexture = new THREE.TextureLoader().load(
        "images/rs/beijing_satellite7.png",
        (texture) => {
          const options = {
            width: 100,
            height: 100,
            depth: 1,
            heightRatio: 3,
            heightTexture: heightTexture,
            diffuseTexture: texture,
            data: features[0],
            color: new THREE.Color(0x244931),
          };
          const terrain = new DistrictTerrain(options).mesh;
          terrain.rotation.x = -Math.PI / 2;
          this.scene.add(terrain);
        }
      );
    },
    computeFeaturesCenter(features) {
      let coordinateList = [];
      features.forEach((feature) => {
        feature.geometry.coordinates.forEach((coordinate) => {
          coordinate.forEach((points) => {
            coordinateList.push(...points);
          });
        });
      });
      let xMax = Math.max(
        ...coordinateList.map((item) => {
          return item[0];
        })
      );
      let xMin = Math.min(
        ...coordinateList.map((item) => {
          return item[0];
        })
      );
      let yMax = Math.max(
        ...coordinateList.map((item) => {
          return item[1];
        })
      );
      let yMin = Math.min(
        ...coordinateList.map((item) => {
          return item[1];
        })
      );
      //计算最值的另一种方法
      // let xMax1 = coordinateList.sort((a,b) => { return b[0]-a[0]})[0][0]
      // let xMin1 = coordinateList.sort((a,b) => { return a[0]-b[0]})[0][0]
      let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
      return center;
    },
    projection(point, center, scale) {
      const projection = d3
        .geoMercator()
        .center(center)
        .translate([0, 0])
        .reflectY(90)
        .scale(scale);
      // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
      return projection(point);
    },
    addTerrain() {
      const heightTexture = new THREE.TextureLoader().load(
        "images/rs/beijing_dem.png"
      );
      const diffuseTexture = new THREE.TextureLoader().load(
        "images/rs/beijing_satellite.png"
      );
      const options = {
        width: 100,
        height: 100,
        depth: 3,
        heightRatio: 3,
        heightTexture: heightTexture,
        diffuseTexture: diffuseTexture,
      };
      const terrain = new DistrictTerrain(options).mesh;
      terrain.rotation.x = -Math.PI / 2;
      this.terrain = terrain;
      this.scene.add(terrain);
    },
  },
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
