<template>
    <div class="tileset-photo"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import {findComponentUpward} from "@/utils/assist.js"


export default {
    name: "tileset-photo",
    props: {
        url: {
            type: String
        }
    },
    data() {
        return {};
    },
    created() {
    },
    mounted() {
        this.$nextTick(() => {
            this.viewer = findComponentUpward(this,"cesiumViewer").viewer;
            console.log(this.viewer);
            this.addTiles();
            
        });
    },
    beforeDestroy() {},
    methods: {
        addTiles() {
            let viewer = this.viewer;
            let options = {
                url: this.url
            }
            let tileset = new Cesium.Cesium3DTileset(options);
            viewer.scene.primitives.add(tileset);
            const that = this;
            tileset.readyPromise.then(function (tileset) {               
                let boundingSphere = tileset.boundingSphere;
                let cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);//获取到倾斜数据中心点的经纬度坐标（弧度）
                console.log(cartographic);
                let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);//倾斜数据中心点的笛卡尔坐标 
                let offset =Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 13);//带高程的新笛卡尔坐标
                let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
                tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
                that.$emit("readyPromise", tileset);
            }).otherwise(function (error) {
                console.log(error);
            }); 
        }
    },
}
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