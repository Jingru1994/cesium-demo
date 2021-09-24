<template>
    <div class="tileset-photo"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import Photogrammetry from '@/utils/widgets/Photogrammetry/Photogrammetry.js'
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
            const that = this;
            const readyPromise = function(tileset) {
                that.$emit("readyPromise", tileset);
            }
            let viewer = this.viewer;
            let options = {
                option: {
                    url: this.url,
                    shadows: Cesium.ShadowMode.DISABLED
                },
                readyPromise: readyPromise
            }
            let tileset = new Photogrammetry(options);
            tileset.addTo(viewer);
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