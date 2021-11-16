<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
// import createScene from "@/utils/sdk/Three/CompositeScene/createScene.js";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    debugger;
    const canvas = document.querySelector("#three");
    this.clock = new THREE.Clock();
    this.meshAnimation = false;
    debugger;
    // createScene(canvas);
    const compositeScene = new CompositeScene({
      container: canvas,
      cameraPosition: [500, 500, 500]
    });
    this.compositeScene = compositeScene;
    this.scene = compositeScene.scene;
    this.camera = compositeScene.camera;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshPhongMaterial({ color: "#045B3A", depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
  },
  beforeDestroy() {
    this.compositeScene.destroy();
  },
  methods: {}
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
