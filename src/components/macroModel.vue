<!--
 * @Author: Dongjingru
 * @Date: 2021-02-23 15:54:52
 * @LastEditTime: 2021-03-02 21:31:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\components\macroModel.vue
-->

<template>
    <div class="macro-model"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import {findComponentUpward} from "@/utils/assist.js"
import {getPublicData} from "@/api/requestData.js";
import InfoTool from "@/utils/widgets/infoBox/infoBox.js"
import shader from "@/utils/shader.js"



export default {
    name: "macro-model",
    props: {
        url: {
            type: String
        },
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
            // this.addEntityPolygon();
            // this.addGeojson();
            // this.addPrimitivePolygon();
            this.addEvent();
        });
        
    },
    beforeDestroy() {},
    methods: {
        addEvent() {
            const that = this;
            this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.clickHandler.setInputAction(function (movement) {
                var pickedFeature = that.viewer.scene.pick(movement.position);
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
        addTiles() {
            const that = this;
            let viewer = this.viewer;
            this.tileset = new Cesium.Cesium3DTileset({
                url: this.url,
                shadows: Cesium.ShadowMode.ENABLED
            });
            this.tileset.readyPromise.then(function (tileset) {
                let boundingSphere = tileset.boundingSphere;
                let cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);//获取到倾斜数据中心点的经纬度坐标（弧度）
                console.log(cartographic);
                let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);//倾斜数据中心点的笛卡尔坐标 
                let offset =Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);//带高程的新笛卡尔坐标
                let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
                tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

                tileset.style = new Cesium.Cesium3DTileStyle({color: "rgba(3, 76, 50,1)",});
                console.log(tileset);
                // tileset.tileVisible.addEventListener(function (tile) {
                tileset.tileLoad.addEventListener(function(tile) {
                    console.log(tile);
                    var content = tile.content;
                    var featuresLength = content.featuresLength;
                    for (var i = 0; i < featuresLength; i += 2) {
                        let feature = content.getFeature(i)
                        let model = feature.content._model

                        if (model && model._sourcePrograms && model._rendererResources) {
                            Object.keys(model._sourcePrograms).forEach(key => {
                                let program = model._sourcePrograms[key]
                                let fragmentShader = model._rendererResources.sourceShaders[program.fragmentShader];
                                if (fragmentShader.indexOf(" v_positionEC;") != -1) {
                                    model._rendererResources.sourceShaders[program.fragmentShader] = shader.glowShader2;
                                } else if (fragmentShader.indexOf(" v_pos;") != -1) {
                                    model._rendererResources.sourceShaders[program.fragmentShader] = shader.glowShader1;
                                }
                                // model._rendererResources.sourceShaders[program.fragmentShader] = shader.glowShader2;
                            })
                            model._shouldRegenerateShaders = true
                        }
                        let infoTool = new InfoTool(viewer);
                        infoTool.add(feature);
                        let infoDiv = infoTool.getElement();
                        infoDiv.addEventListener("click",function(){
                            let infoTable = JSON.parse(feature.getProperty('jproperties'));
                            let property = infoTable.Name;
                            console.log(property);
                            if(property === 'farm1'){
                                that.$router.push({
                                    path: "/detailModel",
                                });
                            }
                        });
                    }
                });
            });
            
            
            this.viewer.scene.primitives.add(this.tileset);
        },
        addGeojson(){
            let viewer = this.viewer;
            let mountainPromise1 = Cesium.GeoJsonDataSource.load(this.url, {
                clampToGround: true
            });
            mountainPromise1.then(function(dataSource) {
                viewer.dataSources.add(dataSource);
                let entities = dataSource.entities.values;
                for (let i = 0; i < entities.length; i++) {
                    let entity = entities[i];
                    entity.polygon.extrudedHeight = 200;
                    entity.polygon.heightReference= Cesium.HeightReference.CLAMP_TO_GROUND;
                    entity.polygon.extrudedHeightReference= Cesium.HeightReference.RELATIVE_TO_GROUND;
                    entity.polygon.closeBottom = false;
                    entity.label = new Cesium.LabelGraphics({//不显示，可能是因为没有position
                        text : "farm",
                        // font : '17px sans-serif',
                        heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(0,-15),
                        // pixelOffsetScaleByDistance : new Cesium.NearFarScalar(1.5e2, 5, 1.5e7, 0.1)
                    });
            
                }
            });
        },
        async addEntityPolygon(){
            const that = this;
            let viewer = this.viewer;
            let dataUrl = this.url;
            let geojsonData = await this.getData(dataUrl);
            let entities = this.createEntity(geojsonData); 
            for(let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                viewer.entities.add(entity);
                let infoTool = new InfoTool(this.viewer);
                infoTool.add(entity);
                let infoDiv = infoTool.getElement();
                infoDiv.addEventListener("click",function(){
                    let property = entity.properties.Name._value;
                    console.log(property);
                    if(property === 'farm1'){
                        that.$router.push({
                            path: "/detailModel",
                        });
                    }
                });
                
            }
        },
        createEntity(features) {
            let entities = [];
            const that = this;
            for(let i=0; i<features.length; i++){
                let positions= [];
                let latitudes = []
                let longitudes = [];
                for(let j=0; j<features[i].geometry.coordinates[0].length; j++){
                    positions.push(features[i].geometry.coordinates[0][j][0]);
                    positions.push(features[i].geometry.coordinates[0][j][1]);
                    longitudes.push(features[i].geometry.coordinates[0][j][0]);
                    latitudes.push(features[i].geometry.coordinates[0][j][1]);
                }
                let polygonOptions = {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
                    material: new Cesium.Color.fromCssColorString('#cc9a0e'),
                    // material: this.getColorRamp([0.3,1],true),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    extrudedHeight: 200,
                    extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                    shadows: Cesium.ShadowMode.ENABLED,//模型影子
                }
                let polygon = new Cesium.PolygonGraphics(polygonOptions);
                let longitude = this.average(longitudes);
                let latitude = this.average(latitudes);
                console.log(longitudes,latitudes);
                console.log(longitude,latitude);
                let lablePosition = Cesium.Cartesian3.fromDegrees(longitude,latitude,200);
                console.log(lablePosition);
                let entityOptions = {
                    name: features[i].properties.Name,
                    properties: features[i].properties,
                    position:lablePosition,
                    polygon: polygon,
                    label : {
                        text : features[i].properties.Name,
                        // font : '17px sans-serif',
                        heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(0,-15),
                        // pixelOffsetScaleByDistance : new Cesium.NearFarScalar(1.5e2, 5, 1.5e7, 0.1)
                    }
                    // properties: features[i].properties
                }
                let entity = new Cesium.Entity(entityOptions);
                console.log(entity);
                entities.push(entity);
                
            }
            return entities;
        },
        async addPrimitivePolygon(){//以primitive方式加载geojson数据，primitive对象更底层，渲染效率更高，但是感觉他没有属性表
            let dataUrl = this.url;
            let geojsonData = await this.getData(dataUrl);
            let primitive = this.createGeometry(geojsonData);
            this.viewer.scene.primitives.add(primitive);
        },
        async getData(url){
            let data = await getPublicData(url);
            return data.features;
        },
        createGeometry(features){
            const instances = [];
            for(let i=0; i<features.length; i++){
                let polygonArr= [];
                for(let j=0; j<features[i].geometry.coordinates[0].length; j++){
                    polygonArr.push(features[i].geometry.coordinates[0][j][0]);
                    polygonArr.push(features[i].geometry.coordinates[0][j][1]);
                }
                console.log(polygonArr);
                let polygon = new Cesium.PolygonGeometry({
                    polygonHierarchy : new Cesium.PolygonHierarchy(
                        Cesium.Cartesian3.fromDegreesArray(polygonArr)
                    ),
                    extrudedHeight: 300,//显示地形与不显示地形时,视觉高度不同,显示地形时部分被遮挡看着矮一些,entity目前设置的方式不会这样
                    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
                });
                let geometry = Cesium.PolygonGeometry.createGeometry(polygon);
                instances.push(new Cesium.GeometryInstance({
                    geometry: geometry,
                    id: features[i].properties.Name,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({alpha : 0.9})),
                    },
                }));
            }
            let primitive = new Cesium.Primitive({
                geometryInstances : instances,
                appearance :  new Cesium.PerInstanceColorAppearance({// 为每个instance着色
                    translucent : true,
                    closed : false
                }),
                asynchronous : false,// 确定基元是异步创建还是阻塞直到准备就绪
            });

            return primitive;
        },
        getColorRamp(elevationRamp, isVertical = true){
            var ramp = document.createElement('canvas');
            ramp.width = isVertical ? 1 : 100;
            ramp.height = isVertical ? 100 : 1;
            let ctx = ramp.getContext('2d');
            let values = elevationRamp;
            let grd = isVertical ? ctx.createLinearGradient(0,0,0,100) : ctx.createLinearGradient(0,0,100,0);
            grd.addColorStop(values[0],'#46ba6d');
            grd.addColorStop(values[1],'#cc9a0e');

            ctx.fillStyle = grd;

            if (isVertical)
                ctx.fillRect(0, 0, 1, 100);
            else
                ctx.fillRect(0, 0, 100, 1);
            return ramp;
        },
        average(nums) {
            return nums.reduce((a, b) => a + b) / nums.length;
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
</style>
