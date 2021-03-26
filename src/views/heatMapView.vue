<template>
    <div class="heatmap-view">
        <cesium-viewer>
        </cesium-viewer>
        
    </div>
</template>

<script>
import * as Cesium from "cesium/Cesium.js"

import {findComponentDownward} from "@/utils/assist.js";
import {getPublicData, toGeojson} from "@/api/requestData";

import HeatLayer from "@/utils/widgets/heatMap/CesiumHeatmap.js"

import CesiumViewer from "@/components/cesiumViewer.vue";
import MacroModel from "@/components/macroModel.vue";

export default {
    name: "HeatmapView",
    components: {
        CesiumViewer,
        MacroModel,
    },
    data() {
        return {
            selectedSkybox: "default",
            macroUrl: "data/farm_macro.geojson",
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        let dataUrl = "data/tmp.json";
        this.createHeatMap(dataUrl);
        this.initCamera();
        let _this = this
        setInterval(() => {
                // this.layer.changePositions(this.positions)
                this.layer.changePositions(this.generatePosition(1000))
            }, 5000)
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cesium.Cartesian3(-4286042.340728672, 11235754.770711167, 6507676.786778767);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-84.61),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        generatePosition(num) {
            let list = []
            for (let i = 0; i < num; i++) {
                let lng = 120.38105869 + Math.random() * 0.5
                let lat = 31.10115627 + Math.random() * 0.5
                list.push({
                    x: lng,
                    y: lat,
                    value: 1
                })
            }
            return list
        },
        async createHeatMap(url) {
            let heatMapData = await this.getData(url);
            let heatmapOptions = {
                gradient: {
                    '0.4': 'blue',
                    '0.6': 'green',
                    '0.8': 'yellow',
                    '0.9': 'white'
                }
            }
            this.positions = heatMapData.data;
            let layer = new HeatLayer(this.viewer, heatmapOptions);
            // layer.setPosition(this.positions);
            layer.setPosition(this.generatePosition(1000));
            this.layer = layer
            
    
            
            
        },
        async getData(url) {
            let data = await getPublicData(url);
            // let geojson = toGeojson(data.list);
            // console.log(geojson);
            // return geojson;
            console.log(data);
            let tmpList = data.list;
            let valueMin = Math.min.apply(Math, tmpList.map(function(o) {return parseFloat(o.t)}));
            let valueMax = Math.max.apply(Math, tmpList.map(function(o) {return parseFloat(o.t)}));
            let west = Math.min.apply(Math, tmpList.map(function(o) {return parseFloat(o.j)}));
            let east = Math.max.apply(Math,tmpList.map(function(o) {return parseFloat(o.j)}));
            let south = Math.min.apply(Math,tmpList.map(function(o) {return parseFloat(o.w)}));
            let north = Math.max.apply(Math,tmpList.map(function(o) {return parseFloat(o.w)}));
            let bounds = {
                west: west,
                east: east,
                south: south,
                north: north
            };
            let processData = {};
            processData.valueMin = valueMin;
            processData.valueMax = valueMax;
            processData.bounds = bounds;
            let len = tmpList.length;
            let dataList = [];
            for(let i = 0; i < len; i++){
                dataList.push({
                    "x": parseFloat(tmpList[i].j),
                    "y": parseFloat(tmpList[i].w),
                    "value": parseFloat(tmpList[i].t)
                });
            }
            processData.data = dataList;
            console.log(processData);
            return processData;
        }
    }

}
</script>

<style lang='scss' scoped>
.skybox-view {
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