<template>
  <div class="tileset-mono"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js";
import { findComponentUpward } from "@/utils/assist.js";
import { createNamespacedHelpers } from "vuex";
const { mapMutations } = createNamespacedHelpers("detailModel");

export default {
  name: "tileset-mono",
  props: {
    url: {
      type: String
    },
    show: {
      type: Boolean
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.viewer = findComponentUpward(this, "cesiumViewer").viewer;
      this.addTiles();
      this.addEvent();
    });
  },
  beforeDestroy() {},
  methods: {
    ...mapMutations({
      setDialogVisible: "SETDIALOGVISIBLE",
      setDataId: "SETDATAID"
    }),
    addTiles() {
      this.tileset = new Cesium.Cesium3DTileset({
        url: this.url,
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
      });
      this.tileset.readyPromise.then(function(tileset) {
        let boundingSphere = tileset.boundingSphere;
        let cartographic = Cesium.Cartographic.fromCartesian(
          boundingSphere.center
        ); //获取到倾斜数据中心点的经纬度坐标（弧度）
        console.log(cartographic);
        let surface = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        ); //倾斜数据中心点的笛卡尔坐标
        let offset = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          13
        ); //带高程的新笛卡尔坐标
        let translation = Cesium.Cartesian3.subtract(
          offset,
          surface,
          new Cesium.Cartesian3()
        );
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
      });

      this.tileset.style = new Cesium.Cesium3DTileStyle({
        color: "rgba(1, 1, 1, 0.01)"
      });
      this.viewer.scene.primitives.add(this.tileset);
    },

    removeTiles() {
      if (this.tileset) {
        console.log(this.tileset);
        this.viewer.scene.primitives.remove(this.tileset);
      }
    },
    addEvent() {
      const that = this;
      let viewer = this.viewer;
      let selected = null;
      this.clickHandler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
      this.clickHandler.setInputAction(function(movement) {
        var pickedFeature = that.viewer.scene.pick(movement.position);
        if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
          let property = pickedFeature.getProperty("Name");
          console.log(property);
          that.setDataId(property);

          if (property !== "farm5-2" && property !== "farm4-2") {
            that.$router.push({
              path: "/detail",
              query: { data: property }
            });
          } else {
            that.setDialogVisible(true);
          }
        }

        var wp = movement.position;
        if (!Cesium.defined(wp)) {
          return;
        }
        var ray = viewer.scene.camera.getPickRay(wp);
        if (!Cesium.defined(ray)) {
          return;
        }
        var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian)) {
          return;
        }
        if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var lon = Cesium.Math.toDegrees(cartographic.longitude);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var elev = viewer.scene.globe.getHeight(cartographic);
        }
        console.log(lon, lat, elev);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.moveHandler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
      this.moveHandler.setInputAction(function(movement) {
        let pickedFeature = that.viewer.scene.pick(movement.endPosition);
        if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
          if (!selected) {
            selected = pickedFeature;
          } else {
            if (pickedFeature != selected) {
              selected.color = new Cesium.Color(1, 1, 1, 0.01);
              selected = pickedFeature;
            }
          }
          selected.color = new Cesium.Color(1, 0, 0, 0.5);
          let property = pickedFeature.getProperty("Name");
          that.setDataId(property);
        } else {
          if (selected) {
            selected.color = new Cesium.Color(1, 1, 1, 0.01);
            selected = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    removeEvent() {
      this.clickHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.moveHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }
  },
  computed: {
    isShow() {
      return this.show;
    }
  },
  watch: {
    isShow: {
      immediate: false,
      handler(newValue) {
        if (newValue === true) {
          console.log("isShow");
          this.addTiles();
          this.addEvent();
        } else {
          console.log("isShow");
          this.removeTiles();
          this.removeEvent();
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
