<template>
    <div class="heatmap-view">
        <div class="operation-panel">
            <el-button @click="showHeatLayer" :disabled="!isHeatlayerExist || isHeatlayerShow">显示</el-button>
            <el-button @click="hideHeatLayer" :disabled="!isHeatlayerExist && !isHeatlayerShow">隐藏</el-button>
            <el-button @click="removeHeatLayer" :disabled="!isHeatlayerExist">移除</el-button>
            <el-button @click="addHeatLayer" :disabled="isHeatlayerExist">添加</el-button>
        </div>
        <cesium-viewer>
        </cesium-viewer>
        
    </div>
</template>

<script>

import Cartesian3 from 'cesium/Core/Cartesian3.js'
import PrimitiveCollection from 'cesium/Scene/PrimitiveCollection.js'
import CesiumMath from "cesium/Core/Math.js"
import Color from 'cesium/Core/Color.js'
import EllipsoidTerrainProvider from 'cesium/Core/EllipsoidTerrainProvider.js'
import TileMapServiceImageryProvider from 'cesium/Scene/TileMapServiceImageryProvider.js'



import {findComponentDownward} from "@/utils/assist.js";
import {getPublicData} from "@/api/requestData";

import FlowLinePrimitive from "@/utils/widgets/FlowLine/FlowLinePrimitive.js"

import CesiumViewer from "@/components/cesiumViewer.vue";

export default {
    name: "FlowLineView",
    components: {
        CesiumViewer
    },
    data() {
        return {
            dataUrl: "data/road_osm.geojson",
            isHeatlayerExist: false,
            isHeatlayerShow: false
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        // this.viewer.terrainProvider = new EllipsoidTerrainProvider({})
        this.initCamera();
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cartesian3(-1237489.601700552, 5048736.751675961, 3764055.1159114563);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : CesiumMath.toRadians(-90.0),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        async createHeatMap(url) {
            let roadData = await this.getData(url);
            let len = roadData.length;
            let primitiveCollection = new PrimitiveCollection({show: false});
            for(let i = 1; i < len; i++) {
                let flowRoadOptions = {
                    positions: roadData[i],
                    width: 5,
                    style: {
                        color: new Color(Math.random() * 0.5 + 0.5, Math.random() * 0.8 + 0.2, 0.0, 1.0),
                        speed: 5,
                        percent: 0.02,
                        gradient: 0.5
                    }
                }
                let flowLine = new FlowLinePrimitive(this.viewer.scene.primitives,flowRoadOptions);
                // primitiveCollection.add(flowLine);
                

            }
            this.primitiveCollection = primitiveCollection;
            
            this.primitiveCollection.show = true;
            console.log(this.primitiveCollection);
            debugger
            this.viewer.scene.primitives.add(this.primitiveCollection);
            console.log(this.viewer.scene.primitives)

        },
        async getData(url) {
            let data = await getPublicData(url)
            console.log(data)
            debugger
            let roadsList = data.features;
            let len = roadsList.length;
            let dataList = [];
            
            for(let i = 0; i < len; i++){
               
                let roadNodes = roadsList[i].geometry.coordinates
                let nodeLen = roadNodes.length;
                let cartesians = [];
                for(let j = 0; j < nodeLen; j++) {
                    cartesians.push(roadNodes[j][0]);
                    cartesians.push(roadNodes[j][1]);
                }
                cartesians = Cartesian3.fromDegreesArray(cartesians);
                dataList.push(cartesians)
                
                
            }
            return dataList;
        },
        async addHeatLayer () {
            let url = this.dataUrl;
            let layer = await this.createHeatMap(url);
            this.layer = layer;
            this.isHeatlayerExist = true;
            this.isHeatlayerShow = true;
        },
        removeHeatLayer() {
            this.layer.remove();
            this.isHeatlayerExist = false;
            this.isHeatlayerShow = false;
        },
        showHeatLayer() {
            this.layer.show();
            this.isHeatlayerShow = true;
        },
        hideHeatLayer() {
            this.layer.hide();
            this.isHeatlayerShow = false;
        }
    }

}
</script>

<style lang='scss' scoped>
.heatmap-view {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    .operation-panel{
        position: fixed;
        top: 20px;
        left:20px;
        padding: 10px 20px;
        background-color: #ffffff;
        border-radius: 4px;
        z-index: 1;
    }
}


</style>