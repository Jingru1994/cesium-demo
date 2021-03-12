<template>
    <div class="text-view">
        <cesium-viewer>
            <entity-text
                :url="textUrl"
                :textStyle="style"
            >

            </entity-text>
        </cesium-viewer>
        
    </div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

import {findComponentDownward} from "@/utils/assist.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import EntityText from "@/components/entityText.vue";

export default {
    name: "PointTextView",
    components: {
        CesiumViewer,
        EntityText
    },
    data() {
        return {
            textUrl: "data/textPoint.geojson",
            style: {}
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        this.style = {
            fontSize: 150,
            color: '#ffffff'
        };
        this.initCamera();
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cesium.Cartesian3(-2343370.912742107, 5325904.115452951, 2606044.8964330205);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-36.29),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        }
    }

}
</script>

<style>

</style>