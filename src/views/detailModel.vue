<template>
  <div class="cesium-index">
    <cesium-viewer :showTerrain="showTerrain">
      <tileset-photogrammetry
        :url="photogrammetryUrl"
        @readyPromise="zoomToTiles"
      ></tileset-photogrammetry>
      <!-- <tileset-monomer
                :url="monomerUrl"
                :show="isMonomerShow"
            ></tileset-monomer>
            <primitive-geojson
                :url="geojsonUrl"
                :show="isGeojsonShow"
            >
            </primitive-geojson> -->
      <entity-point v-if="showPoint" :url="pointUrl" heightType="3dtiles">
      </entity-point>
    </cesium-viewer>
    <div class="toolbar">
      <div class="info-box">模型：{{ dataId }}</div>
      <div>单体化类型：</div>
      <div class="radio-box">
        <input type="radio" name="type" v-model="type" value="geojson" />geojson
        <input type="radio" name="type" v-model="type" value="tiles" />3dtiles
      </div>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>{{ dataId }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="closeDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
const { mapMutations, mapGetters } = createNamespacedHelpers("detailModel");
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js";

import { findComponentDownward } from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import TilesetPhotogrammetry from "@/components/tilesetPhotogrammetry2.vue";
import EntityPoint from "@/components/entityPoint2.vue";
// import TilesetMonomer from "@/components/tilesetMonomer.vue";
// import PrimitiveGeojson from "@/components/primitiveGeojson.vue";

export default {
  name: "DetialModelView",
  components: {
    CesiumViewer,
    TilesetPhotogrammetry,
    // TilesetMonomer,
    // PrimitiveGeojson,
    EntityPoint
  },
  data() {
    return {
      isDialogVisible: false,
      photogrammetryUrl: "http://139.219.1.146/ce/tileset.json",
      monomerUrl: "http://192.168.40.26/file/farm-entity7/tileset.json",
      geojsonUrl: "data/farm_wgs84.geojson",
      type: "tiles",
      dataID: "",
      pointUrl: "/data/detial_point.geojson",
      showTerrain: true,
      showPoint: false
    };
  },
  mounted() {
    this.viewer = findComponentDownward(this, "cesiumViewer").viewer;
    // this.initCamera()
  },
  destroyed() {
    this.showPoint = false;
    console.log("detial destroy1234");
  },
  beforeDestroy() {},
  computed: {
    ...mapGetters({
      dialogVisible: "dialogVisible",
      dataId: "dataId"
    }),
    isMonomerShow() {
      if (this.type === "tiles") {
        return true;
      } else {
        return false;
      }
    },
    isGeojsonShow() {
      if (this.type === "geojson") {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    ...mapMutations({
      setDialogVisible: "SETDIALOGVISIBLE"
    }),
    closeDialog() {
      this.setDialogVisible(false);
    },
    initCamera() {
      let cartesianPosition = new Cesium.Cartesian3(
        -6222983.759138448,
        19996854.06201183,
        14011193.373091104
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0, // east, default value is 0.0 (north)
          pitch: Cesium.Math.toRadians(-90), // default value (looking down)
          roll: 0.0 // default value
        }
      });
    },
    async zoomToTiles() {
      // this.showPoint = true;
      let cartesianPosition = new Cesium.Cartesian3(
        -5619895.44453339,
        18835304.724975035,
        13093351.877161387
      );
      this.viewer.camera.setView({
        destination: cartesianPosition,
        orientation: {
          heading: 0.0, // east, default value is 0.0 (north)
          pitch: Cesium.Math.toRadians(-90), // default value (looking down)
          roll: 0.0 // default value
        }
      });

      const that = this;
      setTimeout(function() {
        let cartesianPosition1 = new Cesium.Cartesian3(
          -2340482.6167533277,
          5325547.696970549,
          2607792.1957136285
        );
        that.viewer.camera.flyTo({
          destination: cartesianPosition1,
          orientation: {
            heading: 0.0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0.0
          },
          duration: 7
        });
        setTimeout(function() {
          that.showPoint = true;
          let cartesianPosition2 = new Cesium.Cartesian3(
            -2340480.17761455,
            5325518.716177278,
            2607507.65613265
          );
          that.viewer.camera.flyTo({
            destination: cartesianPosition2,
            orientation: {
              heading: 0.0,
              pitch: Cesium.Math.toRadians(-27.4),
              roll: 0.0
            }
          });
        }, 8000);
      }, 5000);
    },
    pushRouter(property) {
      console.log(property);
      this.$router.push({
        path: "/detail",
        query: { data: property }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.cesium-index {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  .toolbar {
    position: fixed;
    top: 10px;
    left: 10px;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.5);
    text-align: left;
  }
}
</style>
