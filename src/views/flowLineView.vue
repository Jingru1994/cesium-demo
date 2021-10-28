<template>
  <div class="heatmap-view">
    <div class="operation-panel">
      <el-button @click="showFlowLines" :disabled="!isRoadExist || isRoadShow"
        >显示</el-button
      >
      <el-button @click="hideFlowLines" :disabled="!isRoadExist || !isRoadShow"
        >隐藏</el-button
      >
      <el-button @click="removeFlowLines" :disabled="!isRoadExist"
        >移除</el-button
      >
      <el-button @click="addFlowLines" :disabled="isRoadExist">添加</el-button>
    </div>
    <cesium-viewer>
      <flow-line
        :url="dataUrl"
        :options="roadOptions"
        :isFlowLinesExist="isRoadExist"
        :isflowLinesShow="isRoadShow"
      >
      </flow-line>
    </cesium-viewer>
  </div>
</template>

<script>
// import { createNamespacedHelpers } from "vuex";
// const { mapMutations, mapGetters } = createNamespacedHelpers("flowLine");

import Cartesian3 from "cesium/Core/Cartesian3.js";
import CesiumMath from "cesium/Core/Math.js";

import { findComponentDownward } from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import FlowLine from "@/components/flowLine.vue";

export default {
  name: "FlowLineView",
  components: {
    CesiumViewer,
    FlowLine
  },
  data() {
    return {
      dataUrl: "data/road_osm.geojson",
      roadOptions: {
        width: 3
      },
      isRoadExist: false,
      isRoadShow: false
    };
  },
  mounted() {
    this.viewer = findComponentDownward(this, "cesiumViewer").viewer;
    //调整地图颜色
    let imageryLayers = this.viewer.imageryLayers;
    let layer = imageryLayers.get(0);
    layer.brightness = 0.46;
    layer.contrast = 1.38;
    this.initCamera();
    this.addFlowLines();
  },
  methods: {
    // ...mapMutations({
    //     setFlowlinesExist: "SET_FLOWLINESEXIST",
    //     setFlowlinesShow: "SET_FLOWLINESSHOW",
    // }),
    initCamera() {
      let cartesianPosition = new Cartesian3(
        -1237489.601700552,
        5048736.751675961,
        3764055.1159114563
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0, // east, default value is 0.0 (north)
          pitch: CesiumMath.toRadians(-90.0), // default value (looking down)
          roll: 0.0 // default value
        }
      });
    },
    async addFlowLines() {
      this.isRoadExist = true;
      this.isRoadShow = true;
    },
    removeFlowLines() {
      this.viewer.scene.primitives.remove(this.primitiveCollection);
      this.isRoadExist = false;
      this.isRoadShow = false;
    },
    showFlowLines() {
      this.isRoadShow = true;
    },
    hideFlowLines() {
      this.isRoadShow = false;
    }
  }
  // computed:{
  //     ...mapGetters({
  //         isflowLinesExist: 'isflowLinesExist',
  //         isflowLinesShow: 'isflowLinesShow'
  //     })
  // }
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
