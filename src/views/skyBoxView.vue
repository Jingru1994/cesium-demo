<template>
    <div class="skybox-view">
        <div class="operation-panel">
            <el-radio v-model="selectedSkybox" label="sunny">晴天</el-radio>
            <el-radio v-model="selectedSkybox" label="dusk">黄昏</el-radio>
            <el-radio v-model="selectedSkybox" label="default">默认</el-radio>
        </div>
        <cesium-viewer>
        </cesium-viewer>
        
    </div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import {findComponentDownward} from "@/utils/assist.js";
import CustomSkyBox from "@/utils/widgets/skyBox/customSkyBox.js";

import CesiumViewer from "@/components/cesiumViewer.vue";
import EntityText from "@/components/entityText.vue";

export default {
    name: "CustomSkyBoxView",
    components: {
        CesiumViewer,
        EntityText
    },
    data() {
        return {
            selectedSkybox: "default",
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        console.log(this.viewer.scene.skyBox);
        this.initCamera();
        this.postRender();
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cesium.Cartesian3(-2342900.97718444, 5324904.452147328, 2606337.31982204);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(0.85),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        postRender(){
            let viewer = this.viewer;
            const that = this;
            viewer.scene.postRender.addEventListener(function() {
                if(that.currentSkyBox) {
                    if(!that.defaultSkybox) {
                            that.defaultSkybox = CustomSkyBox.default();
                        }
                    let e = viewer.camera.position;
                    if(Cesium.Cartographic.fromCartesian(e).height<3000 && that.selectedSkybox !== 'default') {
                        console.log(1);
                        viewer.scene.skyBox = that.currentSkyBox;
                        viewer.scene.skyAtmosphere.show = false;
                    }else {
                        console.log(2);
                        viewer.scene.skyBox = that.defaultSkybox;
                        viewer.scene.skyAtmosphere.show = true;
                    }
                }
            })
        }
    },
    watch: {
        selectedSkybox: {
            handler(newVal, oldVal) {
                
                switch(newVal) {
                    case 'default':
                        if(!this.defaultSkybox) {
                            this.defaultSkybox = CustomSkyBox.default();
                        }
                        this.viewer.scene.skyBox = this.defaultSkybox;
                        this.currentSkyBox = this.defaultSkybox;
                        this.viewer.scene.skyAtmosphere.show = true;
                        break;
                    case 'sunny':
                        if(!this.sunnySkyBox) {
                            this.sunnySkyBox = CustomSkyBox.sunny();
                        }
                        this.viewer.scene.skyBox = this.sunnySkyBox;
                        this.currentSkyBox = this.sunnySkyBox;
                        this.viewer.scene.skyAtmosphere.show = false;
                        break;
                    case 'dusk':
                        if(!this.duskSkyBox) {
                            this.duskSkyBox = CustomSkyBox.dusk();
                        }
                        this.viewer.scene.skyBox = this.duskSkyBox;
                        this.currentSkyBox = this.duskSkyBox;
                        this.viewer.scene.skyAtmosphere.show = false;
                        break;
                }
            }
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