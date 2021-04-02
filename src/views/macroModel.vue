<!--
 * @Author: your name
 * @Date: 2021-02-05 11:40:22
 * @LastEditTime: 2021-03-02 17:45:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\views\macroModel.vue
-->
<template>
    <div class="cesium-index">
        <cesium-viewer>
            <macro-model
                :url="macroUrl">
            </macro-model>
            <entity-point
                :url="pointUrl"
                heightType="terrain"
                @pointClick="pushRouter"
            >
            </entity-point>
        </cesium-viewer>
        
    </div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import MacroModel from "@/components/macroModel.vue";
import EntityPoint from "@/components/entityPoint.vue"



export default {
    name: "MacroModelView",
    components: {
        CesiumViewer,
        MacroModel,
        EntityPoint
    },
    data() {
        return {
            publicPath: process.env.BASE_URL,
            macroUrl: "data/farm_macro.geojson",
            // macroUrl: "http://192.168.40.26/file/macro-farm/tileset.json",
            // macroUrl: "http://192.168.137.11/file/farm-entity7/tileset.json",
            pointUrl: "data/macro_point.geojson"
        };
    },
    computed: {
        // pointUrl: function () {
        //     console.log(this.publicPath);
        //     return this.publicPath + this.basePointUrl;
        // }
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
        pushRouter(property){
            console.log(property);
            if(property === '大林养殖场'){
                this.$router.push({
                    path: "/detailModel",
                });
            }
        }
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