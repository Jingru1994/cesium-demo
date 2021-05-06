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
import WallImageTrailMaterialProperty from '@/utils/widgets/ImageWall/WallImageTrailMaterialProperty.js'
import Color from 'cesium/Core/Color.js'


export default {
    name: "DynamicWallView",
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
            let cartesianPosition = new Cartesian3(-2178421.0378274065, 4389187.190167153, 4069972.630906615);
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
            let alp = 1;
            let num = 0;
            let wall = new Entity({
                wall: {
                    positions: Cartesian3.fromDegreesArrayHeights(positions),
                    material: new WallImageTrailMaterialProperty({
                        image:'images/gradientColor.png',
                        color: new CallbackProperty(function () {
                            if ((num % 2) === 0){
                                alp -=0.005;
                            }else {
                                alp +=0.005;
                            }
    
                            if (alp <= 0.3){
                                num++;
                            }else if (alp >= 1){
                                num++;
                            }
                            return  Color.fromBytes(255,254,152).withAlpha(alp)
                        },false),
                        repeat:{x:3,y:1},
                        speed: 1
                    })
                }
            })
            
            wall.show = true
            const that = this
            setTimeout(function(){
                that.viewer.entities.add(wall)
            },2000)
            

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