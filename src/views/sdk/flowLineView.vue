<template>
  <div id="cesiumContainer" class="cesium-container flow-line"></div>
</template>

<script>
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import FlowLine from "@/utils/sdk/Cesium/FlowLine/FlowLine.js";
import PrimitiveCollection from "cesium/Scene/PrimitiveCollection.js";
import Color from "cesium/Core/Color.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import buildModuleUrl from "cesium/Core/buildModuleUrl";
import "cesium/Widgets/widgets.css";

import { getPublicData } from "@/api/requestData.js";

export default {
  data() {
    return {
      roadUrl: "data/road_osm.geojson",
      showTerrain: true
    };
  },
  mounted() {
    this.initViewer();
    this.addFlowLine(this.roadUrl);
  },
  methods: {
    initViewer() {
      buildModuleUrl.setBaseUrl("./resourcesqq/");
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
        -1245797.8821957898,
        5023460.017435593,
        3727492.405743069
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: CesiumMath.toRadians(323.43),
          pitch: CesiumMath.toRadians(-20.2),
          roll: 0.0
        }
      });
      //调整地图颜色
      let imageryLayers = this.viewer.imageryLayers;
      let layer = imageryLayers.get(0);
      layer.brightness = 0.46;
      layer.contrast = 1.38;
    },
    async addFlowLine(roadUrl) {
      let roadData = await getPublicData(roadUrl);
      roadData = roadData.features;
      let primitiveCollection = new PrimitiveCollection({ show: false });
      roadData.forEach(line => {
        const lineCoords = line.geometry.coordinates;
        const flowLineOptions = {
          positions: lineCoords,
          width: 1,
          style: {
            color: new Color(
              Math.random() * 0.5 + 0.5,
              Math.random() * 0.8 + 0.2,
              0.0,
              1.0
            ),
            speed: 7,
            percent: 0.02,
            gradient: 0.5
          },
          clampToGround: true
        };
        let flowLine = new FlowLine(flowLineOptions);
        flowLine.addTo(primitiveCollection);
      });
      primitiveCollection.show = true;
      this.viewer.scene.primitives.add(primitiveCollection);
    }
  }
};
</script>

<style>
.cesium-container.flow-line {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
