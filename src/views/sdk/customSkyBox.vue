<template>
  <div id="cesiumContainer" class="cesium-container skybox"></div>
</template>

<script>
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import CustomSkyBox from "@/utils/sdk/Cesium/CustomSkyBox/CustomSkyBox.js";
import SkyboxType from "@/utils/sdk/Cesium/SkyboxType/SkyboxType.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import "cesium/Widgets/widgets.css";

export default {
  data() {
    return {
      showTerrain: true
    };
  },
  mounted() {
    this.initViewer();
    this.setSkyBox();
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
        -2342900.97718444,
        5324904.452147328,
        2606337.31982204
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(0.85),
          roll: 0.0
        }
      });
    },
    setSkyBox() {
      const skybox = new CustomSkyBox({
        type: SkyboxType.SUNNY
      });
      skybox.setTo(this.viewer);
      // setTimeout(() => {
      //   skybox.destroy();
      // }, 3000);
    }
  }
};
</script>

<style>
.cesium-container.skybox {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
