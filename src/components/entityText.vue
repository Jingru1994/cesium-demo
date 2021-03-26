<template>
    <div class="entity-text"></div>
</template>

<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import {findComponentUpward} from "@/utils/assist.js"
import {getPublicData} from "@/api/requestData.js";


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
                positions = this.getPositions(point)
                debugger;
                let rectangleOptions = {
                    coordinates: positions,
                    material: new Cesium.ImageMaterialProperty({
                        image: that.drawText(style),
                        transparent: true,
                        // color: Cesium.Color.WHITE
                    }),
                    rotation: Cesium.Math.toRadians(style.rotation),
                    stRotation: Cesium.Math.toRadians(style.rotation),
                    height: 50,
                    heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                }
                let rectangle = new Cesium.RectangleGraphics(rectangleOptions);
                let entityOptions = {
                    name: features[i].properties.Name,
                    properties: features[i].properties,
                    rectangle: rectangle
                }
                let entity = new Cesium.Entity(entityOptions);
                entities.push(entity);
                this.style = style;
            }
            
            
                
            
            
            return entities;
        },
        drawText(style) {
            const text = style.text;
            let c = document.createElement("canvas");
            const d = (text + "").length * style.fontSize;
            c.width = d;
            c.height = style.fontSize;
            let ctx = c.getContext("2d");

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
            let positions = Cesium.Rectangle.fromDegrees(
                minLon,
                minLat,
                maxLon,
                maxLat
            );
            return positions;
        },
    }
}
</script>

<style lang='scss' scoped>
</style>
