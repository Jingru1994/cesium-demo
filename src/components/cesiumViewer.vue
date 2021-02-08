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
                baseLayerPicker: true, // 底图切换控件
                animation: false, // 控制场景动画的播放速度控件,
                selectionIndicator: false,//去除原生自带绿色选择框
                terrainProvider: Cesium.createWorldTerrain(),
            };
            let viewer = new Cesium.Viewer("cesiumContainer", viewerOption);
            viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
            viewer.scene.primitives.destroyPrimitives= false;//若不设置为false，移除primitives时会报错，停止渲染
            // viewer.scene.globe.depthTestAgainstTerrain = true;// depth test against terrain is required to make the polygons clamp to terrain不设置立体entity无法贴地
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