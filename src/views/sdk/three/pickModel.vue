<template>
  <div class="three-view">
    <canvas id="three"></canvas>
  </div>
</template>
<script>
import * as THREE from "three";
import CompositeScene from "@/utils/sdk/Three/CompositeScene/CompositeScene.js";
import loadModel from "@/utils/sdk/Three/loadModel/loadModel.js";
import PickModelController from "@/utils/sdk/Three/PickModelController/PickModelController.js";

export default {
  name: "ThreeTourism",
  data() {
    return {};
  },
  created() {},
  async mounted() {
    this.modelUrls = [
      "/model/vase-1.glb",
      "/model/compressor.glb",
      "/model/vase-2.glb"
    ];
    this.createScene();
    this.addPlane();
    this.loadModels();
  },
  beforeDestroy() {
    this.compositeScene.destroy();
    this.pickController.destroy();
  },
  methods: {
    createScene() {
      const canvas = document.querySelector("#three");
      this.clock = new THREE.Clock();
      this.meshAnimation = false;
      const compositeScene = new CompositeScene({
        container: canvas,
        cameraPosition: [0, 80, 150]
      });
      this.compositeScene = compositeScene;
      this.scene = compositeScene.getScene();
      this.camera = compositeScene.getCamera();
      this.renderer = compositeScene.getRenderer();
    },
    addPlane() {
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.MeshPhongMaterial({
          color: "#5c5c5c",
          side: THREE.DoubleSide
        })
      );
      ground.rotation.x = -Math.PI / 2;
      this.scene.add(ground);
    },
    async loadModels() {
      const group = new THREE.Group();
      for (let i = 0; i < this.modelUrls.length; i++) {
        let model = await loadModel({
          modelUrl: this.modelUrls[i]
        });
        if (i === 0) {
          model.position.x = -50;
        } else if (i === 2) {
          model.position.x = 50;
        }
        this.adjustModel(model);
        group.add(model);
        this.scene.add(group);
      }
      const pickController = new PickModelController({
        renderer: this.renderer,
        scene: this.scene,
        camera: this.camera,
        meshes: group
      });
      pickController.startPick();
      this.pickController = pickController;
      // setTimeout(() => {
      //   debugger;
      //   pickController.stopPick();
      // }, 5000);
      // setTimeout(() => {
      //   debugger;
      //   pickController.startPick();
      // }, 10000);
      // setTimeout(() => {
      //   debugger;
      //   pickController.destroy();
      // }, 5000);
    },
    adjustModel(model) {
      model.scale.set(0.1, 0.1, 0.1);
      model.traverse(function(o) {
        if (o.isMesh) {
          o.geometry.center();
        }
      });

      //调整模型位置至场景中心
      let bBox = new THREE.Box3();
      bBox.setFromObject(model);
      let mLen = bBox.max.x - bBox.min.x;
      let mWid = bBox.max.z - bBox.min.z;
      let mHei = bBox.max.y - bBox.min.y;
      let x = bBox.min.x + mLen / 2;
      //   let y = bBox.min.y + mHei / 2;
      let z = bBox.min.z + mWid / 2;
      model.position.set(-x, mHei / 2, -z);
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
