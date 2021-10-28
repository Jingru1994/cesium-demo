<template>
  <div class="tileset-photo"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js";
import { findComponentUpward } from "@/utils/assist.js";

export default {
  name: "tileset-photo",
  props: {
    url: {
      type: String
    }
  },
  data() {
    return {};
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.viewer = findComponentUpward(this, "cesiumViewer").viewer;
      console.log(this.viewer);
      this.addTiles();
    });
  },
  beforeDestroy() {},
  methods: {
    addTiles() {
      let viewer = this.viewer;
      let options = {
        url: this.url,
        shadows: Cesium.ShadowMode.DISABLED
      };
      let tileset = new Cesium.Cesium3DTileset(options);
      viewer.scene.primitives.add(tileset);
      const that = this;
      tileset.readyPromise
        .then(function(tileset) {
          that.$emit("readyPromise", tileset);
        })
        .otherwise(function(error) {
          console.log(error);
        });
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
