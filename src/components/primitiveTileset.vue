<template>
  <div class="primitive-tileset"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import {findComponentUpward} from "@/utils/assist.js"


export default {
  name: "primitive-tileset",
  data() {
    return {};
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
        this.viewer = findComponentUpward(this,"cesiumViewer").viewer;
        console.log(this.viewer);
        this.addTiles();
        
    });
  },
  beforeDestroy() {},
  methods: {
      addTiles() {

        let tileset = new Cesium.Cesium3DTileset({
        url: "http://192.168.137.246/file/data2/tileset.json",
        });
        let viewer = this.viewer;
        viewer.scene.primitives.add(tileset);
        tileset.readyPromise.then(function (tileset,) {               
            // var boundingSphere = tileset.boundingSphere;
            // var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);//获取到倾斜数据中心点的经纬度坐标（弧度）
            // console.log(cartographic);
            // var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);//倾斜数据中心点的笛卡尔坐标 
            // var offset =Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);//带高程的新笛卡尔坐标
            // var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.5, tileset.boundingSphere.radius * 0.25));

        }).otherwise(function (error) {
            console.log(error);
        });

        let tileset1 = new Cesium.Cesium3DTileset({

          url: "http://192.168.137.246/file/farm-entity5/tileset.json",
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        });
        tileset1.style = new Cesium.Cesium3DTileStyle({color: "rgba(255, 0, 0, 0.5)",});
        viewer.scene.primitives.add(tileset1);
    }
  },
}
</script>

<style lang='scss' scoped>
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>