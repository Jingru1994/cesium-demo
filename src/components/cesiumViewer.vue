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
        console.log(pickedFeature);
      
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


      var silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
          silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
          silhouetteBlue.uniforms.length = 0.01;
          silhouetteBlue.selected = [];

          var silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
          silhouetteGreen.uniforms.color = Cesium.Color.LIME;
          silhouetteGreen.uniforms.length = 0.01;
          silhouetteGreen.selected = [];

          viewer.scene.postProcessStages.add(
            Cesium.PostProcessStageLibrary.createSilhouetteStage([
              silhouetteBlue,
              silhouetteGreen,
            ])
          );

          var nameOverlay = document.createElement("div");
        viewer.container.appendChild(nameOverlay);
        nameOverlay.className = "backdrop";
        nameOverlay.style.display = "none";
        nameOverlay.style.position = "absolute";
        nameOverlay.style.bottom = "0";
        nameOverlay.style.left = "0";
        nameOverlay.style["pointer-events"] = "none";
        nameOverlay.style.padding = "4px";
        nameOverlay.style.backgroundColor = "black";
        var selected = {
          feature: undefined,
          originalColor: new Cesium.Color(),
        };

      viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
            movement
          ) {
            // If a feature was previously highlighted, undo the highlight
            silhouetteBlue.selected = [];

            // Pick a new feature
            var pickedFeature = viewer.scene.pick(movement.endPosition);
            if (!Cesium.defined(pickedFeature)) {
              nameOverlay.style.display = "none";
              return;
            }

            // A feature was picked, so show it's overlay content
            nameOverlay.style.display = "block";
            nameOverlay.style.bottom =
              viewer.canvas.clientHeight - movement.endPosition.y + "px";
            nameOverlay.style.left = movement.endPosition.x + "px";
            var name = pickedFeature.getProperty("id");
            nameOverlay.textContent = name;

            // Highlight the feature if it's not already selected.
            if (pickedFeature !== selected.feature) {
              silhouetteBlue.selected = [pickedFeature];
            }
          },
          Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      
    //   let tileset = new Cesium.Cesium3DTileset({
    //     url: "http://192.168.40.48/file/data2/tileset.json",
    //   });
    //   viewer.scene.primitives.add(tileset);
    //   viewer.zoomTo(tileset);
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