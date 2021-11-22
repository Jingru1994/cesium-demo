<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import createBiGradientMaterial from "@/utils/sdk/Three/createBiGradientMaterial/createBiGradientMaterial.js";
import GradientType from "@/utils/sdk/Three/GradientType/GradientType.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.createScene();
    this.addPlane();
  },
  beforeDestroy() {
    this.compositeScene.destroy();
  },
  methods: {
    createScene() {
      const canvas = document.querySelector("#three");
      this.clock = new THREE.Clock();
      this.meshAnimation = false;
      const compositeScene = new CompositeScene({
        container: canvas,
        cameraPosition: [500, 500, 500],
        animateFunction: () => {
          if (this.model) {
            // this.model.rotation.y += 0.1;
            this.model.rotateY(0.01);
          }
        }
      });
      this.compositeScene = compositeScene;
      this.scene = compositeScene.getScene();
      this.camera = compositeScene.getCamera();
    },
    addPlane() {
      const materail = createBiGradientMaterial({
        scene: this.scene,
        color1: "#006AFF",
        color2: "#9500FF",
        // type: GradientType.HORIZONTAL
        type: GradientType.INCLINE
        // type: GradientType.RADIAL
      });
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        materail
      );
      ground.rotation.x = -Math.PI / 2;
      this.scene.add(ground);
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
