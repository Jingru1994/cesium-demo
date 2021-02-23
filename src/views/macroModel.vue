<!--
 * @Author: your name
 * @Date: 2021-02-05 11:40:22
 * @LastEditTime: 2021-02-23 16:35:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\views\macroModel.vue
-->
<template>
    <div class="cesium-index">
        <cesium-viewer>
            <macro-model
                :url="macroUrl"></macro-model>
        </cesium-viewer>
        
    </div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import MacroModel from "@/components/macroModel.vue";



export default {
    name: "MacroModelView",
    components: {
      CesiumViewer,
      MacroModel
    },
    data() {
        return {
            macroUrl: "/data/farm_macro.geojson"
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        this.initCamera();
        
    },
    beforeDestroy() {},
    methods: {
        initCamera(){
            let cartesianPosition = new Cesium.Cartesian3(-2343747.7159778904, 5328774.689863145, 2602077.4026032956);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-15.2),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
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