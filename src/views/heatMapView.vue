<template>
  <div class="heatmap-view">
    <div class="operation-panel">
      <el-button
        @click="showHeatLayer"
        :disabled="!isHeatlayerExist || isHeatlayerShow"
        >显示</el-button
      >
      <el-button
        @click="hideHeatLayer"
        :disabled="!isHeatlayerExist && !isHeatlayerShow"
        >隐藏</el-button
      >
      <el-button @click="removeHeatLayer" :disabled="!isHeatlayerExist"
        >移除</el-button
      >
      <el-button @click="addHeatLayer" :disabled="isHeatlayerExist"
        >添加</el-button
      >
    </div>
    <cesium-viewer> </cesium-viewer>
  </div>
</template>

<script>
import * as Cesium from "cesium/Cesium.js";

import { findComponentDownward } from "@/utils/assist.js";
import { getPublicData } from "@/api/requestData";

import HeatLayer from "@/utils/widgets/heatMap/CesiumHeatmap.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
// import MacroModel from "@/components/macroModel.vue";

export default {
  name: "HeatmapView",
  components: {
    CesiumViewer
    // MacroModel
  },
  data() {
    return {
      dataUrl: "data/tmp.json",
      isHeatlayerExist: false,
      isHeatlayerShow: false
    };
  },
  mounted() {
    this.viewer = findComponentDownward(this, "cesiumViewer").viewer;
    // let dataUrl = "data/tmp.json";
    // this.createHeatMap(dataUrl);
    this.initCamera();
    console.log(this.isHeatlayerExist);
  },
  methods: {
    initCamera() {
      let cartesianPosition = new Cesium.Cartesian3(
        -4286042.340728672,
        11235754.770711167,
        6507676.786778767
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0, // east, default value is 0.0 (north)
          pitch: Cesium.Math.toRadians(-84.61), // default value (looking down)
          roll: 0.0 // default value
        }
      });
    },
    generatePosition(num) {
      let list = [];
      for (let i = 0; i < num; i++) {
        let lng = 120.38105869 + Math.random() * 0.5;
        let lat = 31.10115627 + Math.random() * 0.5;
        list.push({
          x: lng,
          y: lat,
          value: 1
        });
      }
      return list;
    },
    async createHeatMap(url) {
      let heatMapData = await this.getData(url);
      let heatmapOptions = {
        gradient: {
          "0.4": "blue",
          "0.6": "green",
          "0.8": "yellow",
          "0.9": "red"
        }
      };
      this.positions = heatMapData;
      let layer = new HeatLayer(this.viewer.entities, heatmapOptions);
      console.log(layer);
      layer.setPosition(this.positions);
      return layer;
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
    },
    async addHeatLayer() {
      let url = this.dataUrl;
      let layer = await this.createHeatMap(url);
      this.layer = layer;
      this.isHeatlayerExist = true;
      this.isHeatlayerShow = true;
    },
    removeHeatLayer() {
      this.layer.remove();
      this.isHeatlayerExist = false;
      this.isHeatlayerShow = false;
    },
    showHeatLayer() {
      this.layer.show();
      this.isHeatlayerShow = true;
    },
    hideHeatLayer() {
      this.layer.hide();
      this.isHeatlayerShow = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.heatmap-view {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  .operation-panel {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    background-color: #ffffff;
    border-radius: 4px;
    z-index: 1;
  }
}
</style>
