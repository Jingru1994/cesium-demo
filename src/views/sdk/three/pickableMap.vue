<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import { getPublicData } from "@/api/requestData.js";

import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import ExtrudeMap from "@/utils/sdk/Three/ExtrudeMap/ExtrudeMap.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.dataUrls = "data/china.json";
    this.createScene();
    this.addDirectionalLight();
    await this.createMap(this.dataUrls);
    this.compositeScene.initControls(this.labelRenderer);
  },
  beforeDestroy() {
    this.scene.clear();
    this.compositeScene.destroy();
  },
  methods: {
    createScene() {
      const canvas = document.querySelector("#three");
      this.clock = new THREE.Clock();
      const compositeScene = new CompositeScene({
        container: canvas,
        cameraPosition: [0, 0, 200],
        backgroundColor: "#041336",
        initControls: false
      });
      this.compositeScene = compositeScene;
      this.scene = compositeScene.getScene();
      this.camera = compositeScene.getCamera();
      this.renderer = compositeScene.getRenderer();
    },

    async createMap(url) {
      const container = document.querySelector(".three-view");
      const data = await getPublicData(url);
      const map = new ExtrudeMap({
        data: data.features,
        projectCenter: [104.0, 37.5],
        specularColor: "#334676",
        pickable: true,
        renderer: this.renderer,
        camera: this.camera,
        scene: this.scene,
        popup: true,
        dom: container
      });
      this.map = map;
      this.scene.add(map.mesh);
      const labelRenderer = map.getLabelRenderer();
      this.labelRenderer = labelRenderer;
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
      //显示阴影
      // const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera);
      // this.scene.add(debugCamera);
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
