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
import AuroraShield from "@/utils/sdk/Three/AuroraShield/AuroraShield.js";
import PatternShield from "@/utils/sdk/Three/PatternShield/PatternShield.js";
import GlowShield from "@/utils/sdk/Three/GlowShield/GlowShield.js";

export default {
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.boundaryDataUrl = "data/china.json";
    this.createScene();
    this.addDirectionalLight();
    await this.createMap(this.boundaryDataUrl);
    await this.createShield();
  },
  beforeDestroy() {
    this.scene.clear();
    this.compositeScene.destroy();
    this.map.destroy();
    this.auroraShield.destroy();
    this.glowShield.destroy();
    this.patternShield.destroy();
    console.log("3");
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
    async createShield() {
      const auroraShield = new AuroraShield({
        position: [0, 0],
        radius: 10
      });
      this.auroraShield = auroraShield;
      auroraShield.mesh.position.z = 2.1;
      this.scene.add(auroraShield.mesh);

      const patternShield = new PatternShield({
        position: [20, -20],
        radius: 10
      });
      this.patternShield = patternShield;
      patternShield.mesh.position.z = 2.1;
      this.scene.add(patternShield.mesh);
      const glowShield = new GlowShield({
        position: [-20, -20],
        radius: 10
      });
      this.glowShield = glowShield;
      glowShield.mesh.position.z = 2.1;
      this.scene.add(glowShield.mesh);
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
