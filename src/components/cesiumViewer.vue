<template>
  <div id="cesiumContainer" class="cesium-container">
      <slot></slot>
  </div>
  
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";
import { mapMutations } from "vuex";


export default {
  name: "cesiumViewer",
  data() {
    return {
      isTiaozhuan: false
    };
  },
  created() {
    // this.init();
  },
  mounted() {
    this.initViewer();
  },
  beforeDestroy() {},
  methods: {
    ...mapMutations({
      setDialogVisible: 'SETDIALOGVISIBLE',
      setDataId: 'SETDATAID'
    }),
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

      let selected=null;

      const that = this;
      var clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      clickHandler.setInputAction(function (movement) {
        console.log(movement);
        var pickedFeature = viewer.scene.pick(movement.position);
        console.log(pickedFeature);
        if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
          
          let property = pickedFeature.getProperty('Name');
          console.log(property);
          that.setDataId(property);
          if(property !== 'farm5-2' && property !== "farm4-2"){
            that.$router.push({
              path: "/detail",
              query: { data: property },
            });
          }else{
            that.setDataId(property);
            that.setDialogVisible(true);
            
          }
          
        }
        
      
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      var moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      moveHandler.setInputAction(function (movement) {
        
        var pickedFeature = viewer.scene.pick(movement.endPosition);
        if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
          if(!selected){
            selected = pickedFeature;
          }else{
            if(pickedFeature != selected){
              selected.color = new Cesium.Color(1, 1, 1, 0.01);
              selected = pickedFeature;
            }
          }
          selected.color = new Cesium.Color(1, 0, 0, 0.5);
          let property = pickedFeature.getProperty('Name');
          that.setDataId( property );
        }else {
          if(selected){
            selected.color = new Cesium.Color(1, 1, 1, 0.01);
            selected = null;
          }
          
        }
        
      
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
  },
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