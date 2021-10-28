<template>
  <div class="tileset-photo"></div>
</template>

<script>
import Photogrammetry from "@/utils/widgets/Photogrammetry/Photogrammetry.js";
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
      this.addTiles();
    });
  },
  destroyed() {
    this.tileset.destroy();
  },
  beforeDestroy() {
    // this.tileset.destroy();
  },
  methods: {
    addTiles() {
      const that = this;
      const readyPromise = function(tileset) {
        that.$emit("readyPromise", tileset);
      };
      let viewer = this.viewer;
      let options = {
        url: this.url,
        readyPromise: readyPromise
      };
      let tileset = new Photogrammetry(options);
      tileset.addTo(viewer);
      this.tileset = tileset;
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
