<!--
 * @Author: your name
 * @Date: 2021-02-25 16:34:20
 * @LastEditTime: 2021-02-26 17:23:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\components\entityPoint.vue
-->

<!--
 * @Author: Dongjingru
 * @Date: 2021-02-23 15:54:52
 * @LastEditTime: 2021-02-25 14:03:04
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\components\macroModel.vue
-->

<template>
    <div class="entity-point"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import {findComponentUpward} from "@/utils/assist.js"
import InfoTool from "@/utils/widgets/infoBox/infoBox.js"



export default {
    name: "entity-point",
    props: {
        url: {
            type: String
        },
        heightType: {
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
            this.addGeojson();
            this.addEvent();
        });
        
    },
    beforeDestroy() {},
    methods: {
        addEvent() {
            const that = this;
            let terrainProvider = Cesium.createWorldTerrain();
            let ellipsoid = this.viewer.scene.globe.ellipsoid;
            console.log(that.viewer.scene.primitives._primitives._primitives);
            this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.clickHandler.setInputAction(function (movement) {
                let pickedFeature = that.viewer.scene.pick(movement.position);
                if(Cesium.defined(pickedFeature)){
                    let property;
                    if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
                        // property = pickedFeature.getPropertyNames();
                        let infoTable = JSON.parse(pickedFeature.getProperty('jproperties'));
                        property = infoTable.Name;
                    } else if(pickedFeature.id) {
                        property = pickedFeature.id.name;
                        // pickedFeature.id.polygon.material.color = new Cesium.Color(1, 1, 1, 1);
                    }
                    // pickedFeature.primitive.appearance.vertexShaderSource = shader.gradient;//vertexShaderSource为只读，不能这么改
                    // pickedFeature.primitive.appearance.fragmentShaderSource = shader.fragmentShaderSource;
                    console.log(property);
                    if(property === 'farm1'){
                        that.$router.push({
                            path: "/detailModel",
                        });
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },

        addGeojson(){
            let viewer = this.viewer;
            const that = this;
            let mountainPromise1 = Cesium.GeoJsonDataSource.load(this.url, {
                clampToGround: true
            });
            mountainPromise1.then(function(dataSource) {
                viewer.dataSources.add(dataSource);
                let entities = dataSource.entities.values;
                let type;
                let className = "cesium-three-plugins-infotool-";
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    type = entity.properties.Type._value;
                    className += type;

                    entity.billboard = undefined;
                    
                    let infoTool = new InfoTool(viewer,type,className);
                    infoTool.add(entity,that.heightType);
                    let infoDiv = infoTool.getElement();
                    infoDiv.addEventListener("click",function(){
                        let property = entity.properties.Name._value;
                        if(type === 'farm'){
                            property = entity.properties.Name._value;
                        }else {
                            property = entity.properties.Type._value;
                        }
                        
                        that.$emit("pointClick", property);

                        
                    });
                }
            });
        },
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
</style>
