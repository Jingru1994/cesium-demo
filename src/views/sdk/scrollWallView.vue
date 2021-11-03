<template>
  <div id="cesiumContainer" class="cesium-container scroll-wall"></div>
</template>

<script>
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import ScrollWall from "@/utils/sdk/Cesium/ScrollWall/ScrollWall.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import "cesium/Widgets/widgets.css";

export default {
  data() {
    return {
      showTerrain: false
    };
  },
  mounted() {
    this.initViewer();
    this.addScrollWall();
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
        -2178421.0378274065,
        4389187.190167153,
        4069972.630906615
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: CesiumMath.toRadians(342.66),
          pitch: CesiumMath.toRadians(-16.73),
          roll: 0.0
        }
      });
    },
    async addScrollWall() {
      let wallEdgeData = [
        [116.386174, 39.920894],
        [116.386593, 39.912187],
        [116.395363, 39.91249],
        [116.394781, 39.921108],
        [116.386174, 39.920894]
      ];

      const scrollWallOptions = {
        positions: wallEdgeData,
        height: 200,
        speed: 7
      };
      let scrolleWall = new ScrollWall(scrollWallOptions);
      scrolleWall.addTo(this.viewer);
    }
  }
};
</script>

<style>
.cesium-container.scroll-wall {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
