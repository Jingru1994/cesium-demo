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

        // let panoPromise = Cesium.GeoJsonDataSource.load('/farm_wgs84.geojson', {//发起函数，异步写法
        //   stroke: Cesium.Color.fromCssColorString('#FFF173'),
        //   strokeWidth: 2,
        //   clampToGround: true
        // }); // load完之后即为一个promise对象
        // panoPromise.then(function(dataSource) { // 回调函数，异步读取json数据，数据读取成功后返回该对象（dataSource）,下面的功能因为是在数据加载成功后才有意义的，故放在同一个异步里
        //     viewer.dataSources.add(dataSource);
        // });

        let tileset1 = new Cesium.Cesium3DTileset({

          url: "http://192.168.137.246/file/farm-entity5/tileset.json",
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        });
        tileset1.style = new Cesium.Cesium3DTileStyle({color: "rgba(0, 0, 0, 0.01)",});
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