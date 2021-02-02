<template>
  <div class="cesium-index">
      <cesium-viewer>
          <primitive-tileset></primitive-tileset>
      </cesium-viewer>
  </div>
</template>

<script>
import cesiumViewer from "@/components/cesiumViewer.vue";
import primitiveTileset from "@/components/primitiveTileset.vue";


export default {
  name: "CesiumScene",
  components: {
      cesiumViewer,
      primitiveTileset
  },
  data() {
    return {};
  },
  mounted() {
      
  },
  beforeDestroy() {},
  methods: {
  }
};
</script>

<style lang='scss' scoped>
.cesium-index {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>