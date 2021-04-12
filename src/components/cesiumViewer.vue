<!--
 * @Author: your name
 * @Date: 2021-02-03 10:08:15
 * @LastEditTime: 2021-03-02 14:36:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\components\cesiumViewer.vue
-->
<template>
    <div id="cesiumContainer" class="cesium-container">
        <slot></slot>
    </div>
</template>

<script>
import * as Cesium from "cesium/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

export default {
    name: "cesiumViewer",
    props: {
        options: {
            type: Object
        },
        showTerrain: {
            type: Boolean
        }

    },
    data() {
        return {
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
        initViewer() {
            Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODQxZGVkMy00YWY4LTQwYWEtYjA1MS1iZWY4OTk5NGY5MTQiLCJpZCI6MTM5MCwiaWF0IjoxNTI4MjAzNTMyfQ.f0GJ9hn2poToXqb0w8w_RN1AqjxkStR0m2ajNupPbDA';
            let googleImageryProvider = new Cesium.TileMapServiceImageryProvider({            	
                url: 'http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali'
                // url: 'http://www.google.cn/maps/vt?lyrs=s@800&x={x}&y={y}&z={z}'
                // url:'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
            }); 
            // let googleImageryProvider = new Cesium.UrlTemplateImageryProvider({
            //     url: 'http://42.159.85.55/googleImage/satellite/{z}/{x}/{y}/img.jpg'
            // });
            // let clock = new Cesium.Clock({
            //     startTime: Cesium.JulianDate.fromIso8601("2013-12-25"),
            //     currentTime: Cesium.JulianDate.fromIso8601("2013-12-25"),
            //     stopTime: Cesium.JulianDate.fromIso8601("2013-12-26"),
            //     clockRange: Cesium.ClockRange.LOOP_STOP, // loop when we hit the end time
            //     clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
            //     multiplier: 4000, // how much time to advance each tick
            //     shouldAnimate: true, // Animation on by default
            // });
            let viewerOption = {
                geocoder: false, // 地理位置查询定位控件
                homeButton: false, // 默认相机位置控件
                timeline: false, // 时间滚动条控件
                navigationHelpButton: false, // 默认的相机控制提示控件
                fullscreenButton: false, // 全屏控件
                scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存
                baseLayerPicker: true, // 底图切换控件
                imageryProvider: googleImageryProvider,//谷歌影像底图
                animation: false, // 控制场景动画的播放速度控件,
                // terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                // infoBox: false,
                selectionIndicator: false,//去除原生自带绿色选择框
                // skyAtmosphere: false,
                // clockViewModel: new Cesium.ClockViewModel(clock),
            
            };

            viewerOption = Object.assign(viewerOption, this.options)
            if(this.showTerrain) {
                viewerOption.terrainProvider = new Cesium.createWorldTerrain()
            }
            let viewer = new Cesium.Viewer("cesiumContainer", viewerOption);
            viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
            viewer.scene.primitives.destroyPrimitives= false;//若不设置为false，移除primitives时会报错，停止渲染
            
            //调整地图颜色
            // let imageryLayers = viewer.imageryLayers;
            // let layer = imageryLayers.get(0);
            // layer.brightness = 0.46;
            // layer.contrast = 1.38;
            
            //光照、雾、阴影
            viewer.scene.fog.enabled = false;
            viewer.scene.globe.enableLighting = true;
            viewer.shadows = true;
            // viewer.terrainShadows = Cesium.ShadowMode.DISABLED;//地形的阴影，开启后地形闪烁效果不好
            // viewer.shadowMap.softShadows = true;

            viewer.scene.globe.depthTestAgainstTerrain = true;// depth test against terrain is required to make the polygons clamp to terrain不设置立体entity无法贴地

            // 控制用户可以升高的高度
            // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 50;
            // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000;

            // 调整模型颜色
            // viewer.scene.invertClassification = true;//unclassified 3D Tile geometry will render with the color multiplied by Scene#invertClassificationColor
            // viewer.scene.invertClassificationColor = new Cesium.Color(
            //     0.5,
            //     0.5,
            //     0.5,
            //     1.0
            // );
            this.viewer = viewer;

            let clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            clickHandler.setInputAction(function (movement) {
                console.log(movement);
                let pickedFeature = viewer.scene.pick(movement.position);
                console.log(pickedFeature);

                let position = viewer.camera.position;
                let heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(2)
                let pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(2)
                console.log(position+','+heading+','+pitch);
                console.log(viewer.entities);
                console.log(viewer.scene.skyBox);
                
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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