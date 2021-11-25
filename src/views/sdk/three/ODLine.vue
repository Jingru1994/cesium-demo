<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";
import * as d3 from "d3-geo";

import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import ExtrudeMap from "@/utils/sdk/Three/ExtrudeMap/ExtrudeMap.js";
import ODLine from "@/utils/sdk/Three/ODLine/ODLine.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.boundaryDataUrl = "data/china.json";
    this.pointDataUrl = "data/chinaPoint.json";
    this.createScene();
    this.addDirectionalLight();
    await this.createMap(this.boundaryDataUrl);
    await this.createODLine(this.pointDataUrl);
  },
  beforeDestroy() {
    this.scene.clear();
    this.compositeScene.destroy();
    this.map.destroy();
    this.odline.destroy();
  },
  methods: {
    createScene() {
      const canvas = document.querySelector("#three");
      this.clock = new THREE.Clock();
      const compositeScene = new CompositeScene({
        container: canvas,
        cameraPosition: [0, -150, 150],
        backgroundColor: "#041336"
      });
      this.compositeScene = compositeScene;
      this.scene = compositeScene.getScene();
      this.camera = compositeScene.getCamera();
      this.renderer = compositeScene.getRenderer();
    },

    async createMap(url) {
      const data = await getPublicData(url);
      const map = new ExtrudeMap({
        data: data.features,
        projectCenter: [104.0, 37.5],
        specularColor: "#334676",
        pickable: true,
        renderer: this.renderer,
        camera: this.camera,
        scene: this.scene
      });
      this.map = map;
      this.scene.add(map.mesh);
    },
    async createODLine(url) {
      const data = await getPublicData(url);
      const projection = d3
        .geoMercator()
        .center([104.0, 37.5])
        .translate([0, 0])
        .reflectY(90);
      const lines = [];
      let start = data.features.find(
        feature => feature.properties.GNID === "110000"
      );
      start = projection(start.geometry.coordinates);
      data.features.forEach(feature => {
        if (feature.properties.GNID !== "110000") {
          let end = projection(feature.geometry.coordinates);
          lines.push({ start: start, end: end });
        }
      });
      let odline = new ODLine({
        lines: lines,
        dom: this.renderer.domElement,
        style: {
          isHalf: true,
          length: 0.1,
          lineWidth: 4,
          color: "rgb(204, 255, 0)",
          duration: 3000,
          delay: 0
        }
      });
      this.odline = odline;
      odline.mesh.position.z = 2;
      this.scene.add(odline.mesh);
      console.log(lines);
    },

    addDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.1);
      //光源位置
      dirLight.position.set(0, 10, 150);
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
