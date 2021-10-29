<template>
  <div id="cesiumContainer" class="cesium-container float-text"></div>
</template>

<script>
import MyViewer from "@/utils/widgets/MyViewer/MyViewer.js";
import FloatText from "@/utils/sdk/Cesium/FloatText/FloatText.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import "cesium/Widgets/widgets.css";

import { getPublicData } from "@/api/requestData.js";

export default {
  data() {
    return {
      textUrl: "data/textPoint.geojson",
      showTerrain: true
    };
  },
  mounted() {
    this.initViewer();
    this.addFloatText(this.textUrl);
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
        -2343370.912742107,
        5325904.115452951,
        2606044.8964330205
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(-36.29),
          roll: 0.0
        }
      });
    },
    async addFloatText(textUrl) {
      let textData = await getPublicData(textUrl);
      textData = textData.features;
      textData.forEach(item => {
        const position = item.geometry.coordinates;
        const text = item.properties.Name;
        const rotation = item.properties.stRotation;
        const floatTextOptions = {
          position: position,
          height: 50,
          text: text,
          rotation: rotation,
          size: 1,
          color: "#ffffff",
          font: {
            weight: "bold"
          }
        };
        let floatText = new FloatText(floatTextOptions);
        floatText.addTo(this.viewer);
      });
    }
  }
};
</script>

<style>
.cesium-container.float-text {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
