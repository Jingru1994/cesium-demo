<template>
  <div id="cesiumContainer" class="cesium-container">
      <slot></slot>
  </div>
  
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";


export default {
  name: "cesiumViewer",
  data() {
    return {};
  },
  created() {
    // this.init();
  },
  mounted() {
    this.initViewer();
  },
  beforeDestroy() {},
  methods: {
    initViewer() {
      let viewerOption = {
        geocoder: false, // 地理位置查询定位控件
        homeButton: false, // 默认相机位置控件
        timeline: false, // 时间滚动条控件
        navigationHelpButton: false, // 默认的相机控制提示控件
        fullscreenButton: false, // 全屏控件
        scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存
        baseLayerPicker: false, // 底图切换控件
        animation: false, // 控制场景动画的播放速度控件,
        terrainProvider: Cesium.createWorldTerrain(),
      };
      let viewer = new Cesium.Viewer("cesiumContainer", viewerOption);
      viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
      this.viewer = viewer;

      // let panoPromise = Cesium.GeoJsonDataSource.load('/farm_wgs84.geojson', {//发起函数，异步写法
      //   stroke: Cesium.Color.fromCssColorString('#FFF173'),
      //   strokeWidth: 2,
      //   clampToGround: true
      // }); // load完之后即为一个promise对象
      // panoPromise.then(function(dataSource) { // 回调函数，异步读取json数据，数据读取成功后返回该对象（dataSource）,下面的功能因为是在数据加载成功后才有意义的，故放在同一个异步里
      //     viewer.dataSources.add(dataSource);
      // });


      var clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      clickHandler.setInputAction(function (movement) {
        console.log(movement);
        var pickedFeature = viewer.scene.pick(movement.position);
        if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
          debugger
          console.log(pickedFeature);
          var property = pickedFeature.getPropertyNames();
          
          console.log(property);
        }
        
      
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      var moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      moveHandler.setInputAction(function (movement) {
        console.log(movement);
        var pickedFeature = viewer.scene.pick(movement.endPosition);
        console.log(pickedFeature);
        var property = pickedFeature.getPropertyNames();
        
        console.log(property);
      
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
  }
};
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