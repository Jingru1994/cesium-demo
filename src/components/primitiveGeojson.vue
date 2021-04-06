<template>
    <div class="primitive-geojson"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import {findComponentUpward} from "@/utils/assist.js"
import { createNamespacedHelpers } from "vuex";
const { mapMutations } = createNamespacedHelpers("detailModel");


export default {
    name: "primitive-geojson",
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
            console.log(this.viewer);
        });
    },
    beforeDestroy() {},
    methods: {
        ...mapMutations({
            setDialogVisible: 'SETDIALOGVISIBLE',
            setDataId: 'SETDATAID'
        }),
        addData() {
            let viewer = this.viewer;
            const that = this;
            // debugger;
            this.geojsonPromise = Cesium.GeoJsonDataSource.load(this.url, {//发起函数，异步写法
                clampToGround: true,
                fill: new Cesium.Color(1, 1, 1, 0.01)
            }); // load完之后即为一个promise对象
            debugger;
            this.geojsonPromise.then(function(dataSource) { // 回调函数，异步读取json数据，数据读取成功后返回该对象（dataSource）,下面的功能因为是在数据加载成功后才有意义的，故放在同一个异步里
                that.dataSource = dataSource;
                viewer.dataSources.add(that.dataSource);
                let entities = dataSource.entities.values;
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    entity.polygon.material = new Cesium.Color(1, 1, 1, 0.01);
                }
            });
        },
        removeData() {
            debugger;
            this.viewer.dataSources.remove(this.dataSource);
        },
        addEvent() {
            const that = this;
            let viewer = this.viewer;
            let selected=null;
            this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.clickHandler.setInputAction(function (movement) {
                let pickedFeature = that.viewer.scene.pick(movement.position);
                if(pickedFeature && "id" in pickedFeature && pickedFeature.id instanceof Cesium.Entity){
                    let property = pickedFeature.id.properties.Name.getValue(viewer.clock.currentTime);
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
                if(pickedFeature && "id" in pickedFeature && pickedFeature.id instanceof Cesium.Entity){
                    // if("id" in pickedFeature && pickedFeature.id instanceof Cesium.Entity){
                    if(!selected){
                        selected = pickedFeature;
                    }else{
                        if(pickedFeature != selected){
                            selected.id.polygon.material.color = new Cesium.Color(1, 1, 1, 0.01);
                            selected = pickedFeature;
                        }
                    }
                    selected.id.polygon.material.color = new Cesium.Color(1, 0, 0, 0.5);
                    let property = pickedFeature.id.properties.Name.getValue(viewer.clock.currentTime);
                    that.setDataId( property );
                }else {
                    if(selected){
                        selected.id.polygon.material.color = new Cesium.Color(1, 1, 1, 0.01);
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
                    this.addData();
                    this.addEvent();
                }else {
                    console.log("isShow");
                    this.removeData();
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