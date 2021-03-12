<template>
    <div class="entity-text"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import {findComponentUpward} from "@/utils/assist.js"
import InfoTool from "@/utils/widgets/infoBox/infoBox.js"
import {getPublicData} from "@/api/requestGeojson.js";


/**
 *@param {String} url 数据源地址 
 *@param {Object} textStyle 文本样式
 *@param {String} textStyle.color 文本颜色可为字符串也可为rgba
 *@param {Number} textStyle.fontSize 文本字号
 *@param {Number} textStyle.stRotation 文字纹理方向 北方逆时针旋转 暂时不用这个属性，直接用数据里定义的角度比较合理
 */
export default {
    name: "entity-point",
    props: {
        url: {
            type: String
        },
        textStyle: {
            type: Object
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
            this.addEntityText();
        });
        
    },
    beforeDestroy() {},
    methods: {
        async addEntityText(){
            const that = this;
            let viewer = this.viewer;
            let dataUrl = this.url;
            let geojsonData = await this.getData(dataUrl);
            let entities = this.createEntity(geojsonData); 
            for(let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                viewer.entities.add(entity);
            }
        },
        async getData(url){
            let data = await getPublicData(url);
            return data.features;
        },
        createEntity(features) {
            let entities = [];
            const that = this;
            let style = {};
            let point={};
            let positions;
            Object.assign(style, this.textStyle);
            for(let i=0; i<features.length; i++){
                style.text = features[i].properties.Name;
                style.rotation = features[i].properties.stRotation;
                point.lon = features[i].geometry.coordinates[0];
                point.lat = features[i].geometry.coordinates[1];
                point.len = style.text.length;
                positions = this.getPositions(point,style.rotation)
                let polygonOptions = {
                    hierarchy: positions,
                    material: new Cesium.ImageMaterialProperty({
                        image: that.drawText(style),
                        // transparent: true,
                        // color: Cesium.Color.WHITE
                    }),
                    // stRotation: Cesium.Math.toRadians(style.stRotation),
                    // stRotation: Cesium.Math.toRadians(style.stRotation),
                    height: 50,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
                let polygon = new Cesium.PolygonGraphics(polygonOptions);
                let entityOptions = {
                    name: features[i].properties.Name,
                    properties: features[i].properties,
                    polygon: polygon
                }
                let entity = new Cesium.Entity(entityOptions);
                entities.push(entity);
            }
            return entities;
        },

        
        
        drawText(style) {
            const text = style.text;
            var c = document.createElement("canvas");
            const d = (text + "").length * style.fontSize;
            c.width = d;
            c.height = style.fontSize;
            var ctx = c.getContext("2d");

            ctx.fillStyle = style.color;
            ctx.font = "bold " + style.fontSize + "px 微软雅黑"; //设置字体
            ctx.textBaseline = 'hanging'; //在绘制文本时使用的当前文本基线
            //绘制文本
            ctx.fillText(text, 0, 0);
            return c;
        },
        getPositions(point){//
            let minLon = point.lon - point.len*0.00035/2;
            let maxLon =  point.lon + point.len*0.00035/2;
            let minLat = point.lat - 0.000175;
            let maxLat = point.lat + 0.000175;
            let positions = Cesium.Cartesian3.fromDegrees(
                minLon,
                minLat,
                maxLon,
                maxLat
            );
            return positions;
        },
        getPositions1(point,degrees){//
            let minLon = point.lon - point.len*0.00035/2;
            let maxLon =  point.lon + point.len*0.00035/2;
            let minLat = point.lat - 0.000175;
            let maxLat = point.lat + 0.000175;
            let [x1,y1,x2,y2,x3,y3,x4,y4] = [minLon, maxLat, maxLon, maxLat, maxLon, minLat, minLon, minLat];
            
            let positions = [];
            let radians = degrees*Math.PI/180;
            if(degrees !== 0){//使用旋转矩阵计算四角坐标，一种是直接用经纬度计算，一种是转成屏幕坐标计算，但是出来的是角度很小的平行四边形
                // let vertices = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]];
                // let centerCartesian3d = Cesium.Cartesian3.fromDegrees(point.lon, point.lat);
                // let centerWindowCoords = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, centerCartesian3d);
                // let centerX = centerWindowCoords.x;
                // let centerY = centerWindowCoords.y;
                // for(let i = 0; i < 4; i++){
                //     let cartesian3d = Cesium.Cartesian3.fromDegrees(vertices[i][0], vertices[i][1]);
                //     let windowCoordinates = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3d);
                //     let x = windowCoordinates.x;
                //     let y = windowCoordinates.y;
                //     x = (x - centerX)*Math.cos(radians) - (y - centerY)*Math.sin(radians) + centerX;
                //     y = (x - centerX)*Math.sin(radians) + (y - centerY)*Math.cos(radians) + centerY;
                //     windowCoordinates.x = x;
                //     windowCoordinates.y = y;
                //     cartesian3d =  this.viewer.camera.pickEllipsoid(windowCoordinates, this.viewer.scene.globe.ellipsoid);
                //     positions.push(cartesian3d);
                // }

                let vertices = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]];
                let centerX = point.lon;
                let centerY = point.lat;
                for(let i = 0; i < 4; i++){
                    let x = vertices[i][0];
                    let y = vertices[i][1];
                    x = (x - centerX)*Math.cos(radians) - (y - centerY)*Math.sin(radians) + centerX;
                    y = (x - centerX)*Math.sin(radians) + (y - centerY)*Math.cos(radians) + centerY;
                    vertices[i][0] = x;
                    vertices[i][1] = y;
                    
                }
                [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] = vertices;
                positions = Cesium.Cartesian3.fromDegreesArray([
                    x1,
                    y1,
                    x2,
                    y2,
                    x3,
                    y3,
                    x4,
                    y4,
                ]);

            }else{
                positions = Cesium.Cartesian3.fromDegreesArray([
                    x1,
                    y1,
                    x2,
                    y2,
                    x3,
                    y3,
                    x4,
                    y4,
                ]);
            }
            return positions;
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
