<template>
    <div class="tileset-mono"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import {findComponentUpward} from "@/utils/assist.js";
import { mapMutations } from "vuex";


export default {
    name: "tileset-mono",
    props: {
        url: {
            type: String
        },
        show: {
            type: Boolean
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
            this.addTiles();
            this.addEvent();
            
            
        });
    },
    beforeDestroy() {},
    methods: {
        ...mapMutations({
            setDialogVisible: 'SETDIALOGVISIBLE',
            setDataId: 'SETDATAID'
        }),
        addTiles() {
            this.tileset = new Cesium.Cesium3DTileset({
                url: this.url,
                classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
            });
            this.tileset.style = new Cesium.Cesium3DTileStyle({color: "rgba(0, 0, 0, 0.01)",});
            this.viewer.scene.primitives.add(this.tileset);
        },
        
        removeTiles() {
            if(this.tileset){
                console.log(this.tileset);
                this.viewer.scene.primitives.remove(this.tileset);
            }
        },
        addEvent() {
            const that = this;
            let selected=null;
            this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.clickHandler.setInputAction(function (movement) {
                var pickedFeature = that.viewer.scene.pick(movement.position);
                if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
                let property = pickedFeature.getProperty('Name');
                console.log(property);
                that.setDataId(property);

                if(property !== 'farm5-2' && property !== "farm4-2"){
                    that.$router.push({
                    path: "/detail",
                    query: { data: property },
                });
                }else{
                    that.setDataId(property);
                    that.setDialogVisible(true);
                    
                }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.moveHandler.setInputAction(function (movement) {
                let pickedFeature = that.viewer.scene.pick(movement.endPosition);
                if(pickedFeature instanceof Cesium.Cesium3DTileFeature){
                    if(!selected){
                        selected = pickedFeature;
                    }else{
                        if(pickedFeature != selected){
                        selected.color = new Cesium.Color(1, 1, 1, 0.01);
                        selected = pickedFeature;
                        }
                    }
                    selected.color = new Cesium.Color(1, 0, 0, 0.5);
                    let property = pickedFeature.getProperty('Name');
                    that.setDataId( property );
                }else {
                    if(selected){
                        selected.color = new Cesium.Color(1, 1, 1, 0.01);
                        selected = null;
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },
        removeEvent(){
            this.clickHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.moveHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        }
    },
    computed: {
        isShow() {
            return this.show;
        },
    },
    watch: {
        isShow: {
            immediate: false,
            handler(newValue){
                if(newValue === true){
                    console.log("isShow");
                    this.addTiles();
                    this.addEvent();
                }else {
                    console.log("isShow");
                    this.removeTiles();
                    this.removeEvent();
                }
            }
            
        }
    }
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