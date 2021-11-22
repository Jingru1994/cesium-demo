<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import loadModel from "@/utils/sdk/Three/loadModel/loadModel.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.createScene();
    this.addPlane();
    this.loadModels();
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
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshPhongMaterial({
          color: "#045B3A",
          side: THREE.DoubleSide
        })
      );
      ground.rotation.x = -Math.PI / 2;
      this.scene.add(ground);
    },
    async loadModels() {
      //gltf 示例
      const model = await loadModel({
        modelUrl: "/model/vase-1.glb",
        getLoadPercent: percentage => {
          console.log(percentage);
        }
      });
      //obj 示例
      // const model = await loadModel({
      //   modelUrl: "/model/Vase-obj.obj",
      //   materialUrl: "/model/Vase-obj.mtl",
      //   getLoadPercent: percentage => {
      //     console.log(percentage);
      //   }
      // });
      //draco gltf示例
      // const model = await loadModel({
      //   modelUrl: "/model/vase8Draco.gltf",
      //   type: "draco",
      //   getLoadPercent: percentage => {
      //     console.log(percentage);
      //   }
      // });
      //fbx示例
      // const model = await loadModel({
      //   modelUrl: "/model/vase3.fbx",
      //   // type: "draco",
      //   getLoadPercent: percentage => {
      //     console.log(percentage);
      //   }
      // });
      // model.scale.set(0.01, 0.01, 0.01);
      this.scene.add(model);
      this.model = model;
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
