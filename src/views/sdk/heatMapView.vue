<template>
  <div id="cesiumContainer" class="cesium-container heatmap"></div>
</template>

<script>
import MyViewer from "@/utils/sdk/Cesium/MyViewer/MyViewer.js";
import HeatMap from "@/utils/sdk/Cesium/HeatMap/HeatMap.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";
import "cesium/Widgets/widgets.css";
import { getPublicData } from "@/api/requestData";

export default {
  data() {
    return {
      showTerrain: false,
      url: "data/tmp.json"
    };
  },
  mounted() {
    this.initViewer();
    this.addHeatMap(this.url);
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
        -4286042.340728672,
        11235754.770711167,
        6507676.786778767
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(-84.61),
          roll: 0.0
        }
      });
    },
    async addHeatMap(url) {
      let heatMapData = await this.getData(url);
      const options = {
        positions: heatMapData,
        heatmapOptions: {
          gradient: {
            "0.4": "blue",
            "0.6": "green",
            "0.8": "yellow",
            "0.9": "red"
          }
        }
      };
      const heatMap = new HeatMap(options);
      heatMap.addTo(this.viewer);

      // setTimeout(() => {
      //   // const options = {
      //   //   gradient: {
      //   //     "0.4": "blue",
      //   //     "0.6": "green",
      //   //     "0.8": "yellow",
      //   //     "0.9": "blue"
      //   //   }
      //   // };
      //   // heatMap.setOptions(options);
      //   // const data = this.generatePosition(200);
      //   heatMap.changePositions(heatMapData);
      // }, 5000);
    },
    generatePosition(num) {
      let list = [];
      for (let i = 0; i < num; i++) {
        let lng = 120.38105869 + Math.random() * 5;
        let lat = 31.10115627 + Math.random() * 5;
        list.push({
          x: lng,
          y: lat,
          value: 1
        });
      }
      return list;
    },
    async getData(url) {
      let data = await getPublicData(url);
      let tmpList = data.list;
      let len = tmpList.length;
      let dataList = [];
      for (let i = 0; i < len; i++) {
        dataList.push({
          x: parseFloat(tmpList[i].j),
          y: parseFloat(tmpList[i].w),
          value: parseFloat(tmpList[i].t)
        });
      }
      return dataList;
    }
  }
};
</script>

<style>
.cesium-container.heatmap {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
