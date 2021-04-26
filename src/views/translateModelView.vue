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
import * as Cesium from "cesium/Cesium.js"

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import Color from 'cesium/Core/Color.js'
import TranslationController from '@/utils/widgets/TranslateModel/TranslationController.js'


export default {
    name: "TranslateModelView",
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
            let cartesianPosition = new Cartesian3(-2177263.5907091694, 4388623.129374539, 4070502.643114972);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading :CesiumMath.toRadians(344.33), // east, default value is 0.0 (north)
                    pitch : CesiumMath.toRadians(-28.66),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        async addWall() {
            const url = "model/GroundVehicle.glb";
            const pos = Cesium.Cartesian3.fromDegrees(116.386593, 39.912187, 10);
            const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(pos);
            const that = this
            const model = this.viewer.scene.primitives.add(
                Cesium.Model.fromGltf({
                    url: url,
                    modelMatrix: matrix
                })
            )
            model.readyPromise.then(function (model) {
                console.log("-------------------------------------------------")
                let modelController = new TranslationController(that.viewer)
                modelController.add(model)
            })
           


            
            // this.viewer.camera.lookAtTransform(matrix, new Cesium.Cartesian3(-50, 0, 800));




            // let position = Cartesian3.fromDegrees(116.386593,39.912187,0)

            // const vectorNormalUp = new Cartesian3()
            // const vZ = new Cartesian3(0, 0, 1)
            // Cartesian3.normalize(position.clone(), vectorNormalUp)

            // // 向右的向量
            // const vectorNormalRight = new Cartesian3()
            // // 由z轴向上 地表向上两个向量叉乘, 则可以得出, 向右的向量
            // Cartesian3.cross(vZ, vectorNormalUp, vectorNormalRight)
            // Cartesian3.normalize(vectorNormalRight, vectorNormalRight)



            // const options = {
            //     width: 15 / 15,
            //     headWidth: 15 / 6,
            //     length: 15 * 5,//坐标轴的长度应该视模型的直径而定
            //     headLength: 15 / 3,
            //     position: position
            // }

            // let axisX = new LineAxis({
            //     id: 'axisX',
            //     color: Color.GREEN,
            //     direction: vectorNormalRight,
            //     unit: Cartesian3.UNIT_X,
            //     ...options
            // })
            // console.log(axisX.primitive)
            // this.viewer.scene.primitives.add(axisX.primitive);

            // // var heading = Cesium.Math.toRadians(0.0);
            // // var pitch = Cesium.Math.toRadians(-25.0);
            // // var roll = Cesium.Math.toRadians(0);
            // // var range = 0;
            // // this.viewer.flyTo(axisX, {
            // //     offset: new Cesium.HeadingPitchRange(heading, pitch, range),
            // // });

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