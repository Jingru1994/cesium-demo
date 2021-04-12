<template>
    <div class="heatmap-view">
        <cesium-viewer>
        </cesium-viewer>
        
    </div>
</template>

<script>
// import { createNamespacedHelpers } from "vuex";
// const { mapMutations, mapGetters } = createNamespacedHelpers("flowLine");

import Cartesian3 from 'cesium/Core/Cartesian3.js'
import Entity from "cesium/DataSources/Entity.js"
import CallbackProperty from "cesium/DataSources/CallbackProperty.js"
import CesiumMath from "cesium/Core/Math.js"

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
// import '@/utils/widgets/FlowLine/PolylineFlowMaterial.js'
import Material from 'cesium/Scene/Material.js'
import WallTrailMaterialProperty from '@/utils/widgets/TrailWall/WallTrailMaterialProperty.js'
import Color from 'cesium/Core/Color.js'


export default {
    name: "FlowLineView",
    components: {
        CesiumViewer
    },
    data() {
        return {
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        this.initCamera();
        this.addWall();
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cartesian3(-2179342.1178893023, 4390086.862318702, 4069355.119685325);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading :CesiumMath.toRadians(342.66), // east, default value is 0.0 (north)
                    pitch : CesiumMath.toRadians(-16.73),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        async addWall() {
            let positions = [116.386174,39.920894,200,
                116.386593,39.912187,200,
                116.395363,39.91249,200,
                116.394781,39.921108,200,
                116.386174,39.920894,200,

            ];
            let wall = new Entity({
                wall: {
                    positions: Cartesian3.fromDegreesArrayHeights(positions),
                    material: new WallTrailMaterialProperty({
                        color: Color.fromBytes(255,0,0),
                        speed: 8
                    })
                }
            })
            
            wall.show = true
            const that = this
            setTimeout(function(){
                that.viewer.entities.add(wall)
            },1000)
            

        },
    },
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