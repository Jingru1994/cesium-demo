<template>
    <div class="cesium-index">
        <cesium-viewer>
            
        </cesium-viewer>
        
    </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"
import widget from "cesium/Widgets/widgets.css";

import {findComponentDownward} from "@/utils/assist.js";
import {getPublicData} from "@/api/requestGeojson.js";
import InfoTool from "@/utils/widgets/infoBox/infoBox.js"

import CesiumViewer from "@/components/cesiumViewer.vue";



export default {
    name: "MacroModelView",
    components: {
      CesiumViewer,
    },
    data() {
        return {
        };
    },
    mounted() {
        this.viewer = findComponentDownward(this,"cesiumViewer").viewer;
        this.initCamera();
        // this.addGeojson();
        this.addEntityPolygon();
        // this.addPrimitivePolygon();
        this.addEvent();
        
    },
    beforeDestroy() {},
    computed: {
    },
    methods: {
        initCamera(){
            let cartesianPosition = new Cesium.Cartesian3(-2343747.7159778904, 5328774.689863145, 2602077.4026032956);
            this.viewer.camera.setView({
                destination : cartesianPosition,
                orientation: {
                    heading : 0.0, // east, default value is 0.0 (north)
                    pitch : Cesium.Math.toRadians(-15.2),    // default value (looking down)
                    roll : 0.0  // default value
                }
            });
        },
        addEvent() {
            const that = this;
            this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            this.clickHandler.setInputAction(function (movement) {
                var pickedFeature = that.viewer.scene.pick(movement.position);
                if(Cesium.defined(pickedFeature)){
                    let property
                    if (feature instanceof Cesium3DTileFeature) {
                        property = pickedFeature.getProperty("Name");
                    } else if(pickedFeature.id) {
                        property = pickedFeature.id.name; 
                    }
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
            let mountainPromise1 = Cesium.GeoJsonDataSource.load('/data/farm_macro.geojson', {
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
                }
            });
        },
        async addEntityPolygon(){
            let viewer = this.viewer;
            let dataUrl = "/data/farm_macro.geojson";
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
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    extrudedHeight: 200,
                    extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                }
                let polygon = new Cesium.PolygonGraphics(polygonOptions);
                let longitude = this.average(longitudes);
                let latitude = this.average(latitudes);
                console.log(longitudes,latitudes);
                console.log(longitude,latitude);
                let lablePosition = Cesium.Cartesian3.fromDegrees(longitude,latitude,200);
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
                entities.push(entity);
                
            }
            return entities;
        },
        async addPrimitivePolygon(){//以primitive方式加载geojson数据，primitive对象更底层，渲染效率更高，但是感觉他没有属性表
            let dataUrl = "/data/farm_macro.geojson";
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
        getColorRamp(elevationRamp){
            var ramp = document.createElement('canvas');
            ramp.width=1;
            ramp.height = 100;
            let ctx = ramp.getContext('2d');
            let values = elevationRamp;
            let grd = ctx.createLinearGradient(0,0,50,100);
            grd.addColorStop(values[0],'#46ba6d');
            grd.addColorStop(values[1],'#cc9a0e');

            ctx.fillStyle = grd;
            ctx.fillRect(0,0,1,100);
            return ramp;
        },
        average(nums) {
            return nums.reduce((a, b) => a + b) / nums.length;
        }
    }
};
</script>

<style lang='scss' scoped>
.cesium-index {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

</style>