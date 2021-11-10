<template>
  <div id="cesiumContainer" class="cesium-container transformation"></div>
</template>

<script>
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import TransformationController from "@/utils/sdk/Cesium/TransformationController/TransformationController.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import Transforms from "cesium/Core/Transforms.js";
import Model from "cesium/Scene/Model";
// import ModelGraphics from "cesium/DataSources/ModelGraphics";
import "cesium/Widgets/widgets.css";

export default {
  data() {
    return {
      showTerrain: false
    };
  },
  mounted() {
    this.initViewer();
    this.addModel();
  },
  methods: {
    initViewer() {
      const viewerOptions = {
        container: "cesiumContainer",
        IonToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODQxZGVkMy00YWY4LTQwYWEtYjA1MS1iZWY4OTk5NGY5MTQiLCJpZCI6MTM5MCwiaWF0IjoxNTI4MjAzNTMyfQ.f0GJ9hn2poToXqb0w8w_RN1AqjxkStR0m2ajNupPbDA",
        imageryUrl:
          "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
        showTerrain: this.showTerrain
      };
      let viewer = new MyViewer(viewerOptions);
      viewer = viewer.getElement();
      this.viewer = viewer;

      let cartesianPosition = new Cartesian3(
        -2177263.5907091694,
        4388623.129374539,
        4070502.643114972
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: CesiumMath.toRadians(344.33),
          pitch: CesiumMath.toRadians(-28.66),
          roll: 0.0
        }
      });
    },
    async addModel() {
      const url = "model/GroundVehicle.glb";
      const pos = Cartesian3.fromDegrees(116.386593, 39.912187, 10);
      const matrix = Transforms.eastNorthUpToFixedFrame(pos);
      const model = this.viewer.scene.primitives.add(
        Model.fromGltf({
          url: url,
          modelMatrix: matrix
        })
      );
      model.readyPromise.then(model => {
        let modelController = new TransformationController(this.viewer);
        modelController.add(model);
        // setTimeout(() => {
        //   modelController.destroy();
        // }, 5000);
      });
    }
  }
};
</script>

<style>
.cesium-container.transformation {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
