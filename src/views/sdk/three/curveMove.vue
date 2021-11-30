<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import CurveMotion from "@/utils/sdk/Three/CurveMotion/CurveMotion.js";

export default {
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.createScene();
    this.addDirectionalLight();
    this.createMovedMesh();
  },
  beforeDestroy() {
    this.scene.clear();
    this.compositeScene.destroy();
    this.motion.destroy();
  },
  methods: {
    createScene() {
      const canvas = document.querySelector("#three");
      this.clock = new THREE.Clock();
      const compositeScene = new CompositeScene({
        container: canvas,
        cameraPosition: [0, -30, 30],
        backgroundColor: "#041336"
      });
      this.compositeScene = compositeScene;
      this.scene = compositeScene.getScene();
      this.camera = compositeScene.getCamera();
      this.renderer = compositeScene.getRenderer();
    },
    createMovedMesh() {
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
      const cubeMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color("rgba(184,179,46,1)"),
        specular: new THREE.Color("rgba(55,55,55,1)"),
        shininess: 32.0
      });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      this.scene.add(cube);
      let nodeList = [
        [0, 0, 0],
        [0, 10, 10],
        [10, 10, 10],
        [10, 0, 0]
      ];
      const motion = new CurveMotion({
        nodes: nodeList,
        object: cube,
        speed: 0.05
      });
      this.motion = motion;
      this.scene.add(motion.line);
    },

    addDirectionalLight() {
      //方向光
      const dirLight = new THREE.DirectionalLight("#fff", 0.1);
      //光源位置
      dirLight.position.set(0, 10, 150);
      //可以产生阴影
      dirLight.castShadow = true;
      dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
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
