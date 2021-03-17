// InfoTool.js
// ====================
// 引入模块
// ====================
import Viewer from "@/../node_modules/cesium/Source/Widgets/Viewer/Viewer.js";
import CesiumMath from "@/../node_modules/cesium/Source/Core/Math.js";
import Cesium3DTileFeature from "@/../node_modules/cesium/Source/Scene/Cesium3DTileFeature.js";
// import Cesium3DTile from "@/../node_modules/cesium/Source/Scene/Cesium3DTile.js";
import Cartesian2 from "@/../node_modules/cesium/Source/Core/Cartesian2.js";
import Cartesian3 from "@/../node_modules/cesium/Source/Core/Cartesian3.js";
import Cartographic from "@/../node_modules/cesium/Source/Core/Cartographic.js";
import sampleTerrainMostDetailed from "@/../node_modules/cesium/Source/Core/sampleTerrainMostDetailed.js"
import defined from "@/../node_modules/cesium/Source/Core/defined.js";
import './info.css';
import { setCss, getCss, setInnerText, getGuid} from "@/utils//util.js";

// ====================
// 类
// ====================
/**
* 信息工具。
*
* @author Helsing https://www.cnblogs.com/HelsingWang/p/14010452.html
* @date 2019/12/22
* @alias InfoTool
* @constructor
* @param {Viewer} viewer Cesium视窗。
*/
class InfoTool {
    /**
    * 创建一个动态实体弹窗。
    *
    * @param {Viewer} viewer Cesium视窗。
    * @param {Number} options 选项。
    * @param {Cartesian3} options.position 弹出位置。
    * @param {HTMLElement} options.element 弹出窗元素容器。
    * @param {Function} callback 回调函数。
    * @ignore
    */
    static createInfoTool(viewer, options, callback = undefined) {
        console.log(options);
        let cartographic;
        cartographic = options.position;
        const lon = CesiumMath.toDegrees(cartographic.longitude); //.toFixed(5);
        const lat = CesiumMath.toDegrees(cartographic.latitude); //.toFixed(5);

        // 注意，这里不能使用hide()或者display，会导致元素一直重绘。
        // setCss(options.element, "opacity", "0"); 
        // setCss(options.element.querySelector("div:nth-child(1)"), "height", "1px");
        // setCss(options.element.querySelector("div:nth-child(2)"), "opacity", "1");

        // 回调
        callback();

        // 添加div弹窗
        // InfoTool.popup(viewer, options.element, lon, lat, cartographic.height)
        setTimeout(function () {
            InfoTool.popup(viewer, options, lon, lat, cartographic.height)
        }, 500);

        
    }
    /**
    * 弹出HTML元素弹窗。
    *
    * @param {Viewer} viewer Cesium视窗。
    * @param {Element|HTMLElement} element 弹窗元素。
    * @param {Number} lon 经度。
    * @param {Number} lat 纬度。
    * @param {Number} height 高度。
    * @ignore
    */
    static popup(viewer, options, lon, lat, height) {
        let element = options.element;
        // setCss(element, "opacity", "1");
        setTimeout(function () {
            // 设置元素效果
            // setCss(element, "opacity", "1");
            // if(options.type === 'farm'){
            //     setCss(element, "opacity", "1");
                
            // }else {
            //     setCss(element, "opacity", "1");
            //     // setCss(element.querySelector("div:nth-child(2)"), "display", "none");
            //     // element.querySelector("div:nth-child(1)").addEventListener("mouseover",function(){
            //     //     setCss(element.querySelector("div:nth-child(2)"), "display", "block");
            //     // });
            //     // element.querySelector("div:nth-child(1)").addEventListener("mouseout",function(){
            //     //     setCss(element.querySelector("div:nth-child(2)"), "display", "none");
            //     // });
            //     // setCss(element.querySelector("div:nth-child(2)"), "width", "0");
            // }
            // setCss(element.querySelector("div:nth-child(2)"), "opacity", "1");
            // setCss(element.querySelector("div:nth-child(1)"), "transition", "ease 1s");
            // setCss(element.querySelector("div:nth-child(2)"), "transition", "opacity 1s");
            // setCss(element.querySelector("div:nth-child(1)"), "height", "80px");
            // setCss(element.querySelector("div:nth-child(2)"), "pointer-events", "auto");
            // window.setTimeout(function () {
            //     setCss(element.querySelector("div:nth-child(2)"), "opacity", "1");
            // }, 500);
        }, 100);
        const divPosition = Cartesian3.fromDegrees(lon, lat, height);
        console.log(parseInt(getCss(element, "height")));
        InfoTool.hookToGlobe(viewer, element, divPosition, [options.xOffset, -(parseInt(getCss(element, "height")))], true);
        viewer.scene.requestRender();
    }
    /**
     * 将HTML弹窗挂接到地球上。
     *
     * @param {Viewer} viewer Cesium视窗。
     * @param {Element} element 弹窗元素。
     * @param {Cartesian3} position 地图坐标点。
     * @param {Array} offset 偏移。
     * @param {Boolean} hideOnBehindGlobe 当元素在地球背面会自动隐藏，以减轻判断计算压力。
     * @ignore
     */
    static hookToGlobe(viewer, element, position, offset, hideOnBehindGlobe) {
        const scene = viewer.scene, camera = viewer.camera;
        const cartesian2 = new Cartesian2();
        scene.preRender.addEventListener(function () {
            const canvasPosition = scene.cartesianToCanvasCoordinates(position, cartesian2); // 笛卡尔坐标到画布坐标
            if (defined(canvasPosition)) {
                setCss(element, "left", parseInt(canvasPosition.x + offset[0]) + "px");
                setCss(element, "top", parseInt(canvasPosition.y + offset[1]) + "px");

                // 是否在地球背面隐藏
                if (hideOnBehindGlobe) {
                    const cameraPosition = camera.position;
                    let height = scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;
                    height += scene.globe.ellipsoid.maximumRadius;
                    if (!(Cartesian3.distance(cameraPosition, position) > height)) {
                        setCss(element, "display", "flex");
                    } else {
                        setCss(element, "display", "none");
                    }
                }
            }
         });
     }
 
    // element;
    // viewer;
    // type;
 
    constructor(viewer,type,className) {
        this.viewer = viewer;

        // 在Cesium容器中添加元素
        this.element = document.createElement("div");
        this.element.id = "infoTool_" + getGuid(true);
        this.element.name = "infoTool";
        this.element.classList.add("cesium-three-plugins-infotool");
        this.element.classList.add(className);
        this.element.appendChild(document.createElement("div"));
        this.element.appendChild(document.createElement("div"));
        viewer.container.appendChild(this.element);
        this.type = type;
    }

    /**
     * @description: 
     * @param {*}
     * @return {*}
     */
    getElement(){
        return this.element
    }
 
    /**
     * 添加。
     *
     * @author Helsing
     * @date 2019/12/22
     * @param {Object} options 选项。
     * @param {Element} options.element 弹窗元素。
     * @param {Cartesian2|Cartesian3} options.position 点击位置。
     * @param {Cesium3DTileFeature} [options.inputFeature] 模型要素。
     * @param {String} options.type 类型（默认值为default，即任意点击模式；如果设置为info，即信息模式，只有点击Feature才会响应）。
     * @param {String} options.content 内容（只有类型为default时才起作用）。
     * @param {Function} callback 回调函数。
     */
    async add(feature, HeightType, callback = undefined) {
        // 判断参数为空返回
        if (!feature) {
            return;
        }
        let options = {};
        options.feature = feature;
        options.type = this.type;

        if(options.type === 'farm'){
            options.xOffset = -42.5
            
        }else {
            options.xOffset = -29.5
        }

        const that = this;

        // 1.组织信息
        let info = '';

        // 判断拾取要素为空返回
        if (!defined(feature)) {
            this.remove();
            return;
        }
        if (feature instanceof Cesium3DTileFeature) { // 3dtiles
            let property;
            console.log(feature);
            options.position = Cartographic.fromCartesian(feature.content.tile.boundingSphere.center);
            let infoTable = JSON.parse(feature.getProperty('jproperties'));
            property = infoTable.Name;
            info += property;

            // let propertyNames = feature.getPropertyNames();
            // let length = propertyNames.length;
            // for (let i = 0; i < length; ++i) {
            //     let propertyName = propertyNames[i];
            //     info += '"' + (propertyName + '": "' + feature.getProperty(propertyName)) + '",\n';
            //     // let position = feature.tileset.boundingSphere.center;
            // }
        } else if (feature.id) { // Entity
            const properties = feature.properties;
            if (properties) {
                info += properties.Name._value;
                // if(options.type === 'farm'){
                //     info += properties.Name._value;
                // }else {
                //     info += properties.Type._value;
                // }
            }
            let position
            if(HeightType === 'terrain'){
                position = await this.mySampleTerrain(feature.position._value);
                position = position[0]
            }else if(HeightType  === '3dtiles') {
                position = await this.myClampToHeigh(feature.position._value);
                position = Cartographic.fromCartesian(position[0]);
                // let cartographic = Cartographic.fromCartesian(feature.position._value);
                // position = new Cartographic(cartographic.longitude,cartographic.latitude,properties.Height1._value)
            }
            
            options.position = position;
            console.log(options.position);
        }


        // 2.生成特效
        // 添加之前先移除
        // this.remove();

        if (!info) {
            return;
        }

        // options.position = cartesian3d;
        options.element = options.element || this.element;


        InfoTool.createInfoTool(this.viewer, options, function () {
            setInnerText(that.element.querySelector("div:nth-child(2)"), info);
            typeof callback === "function" && callback();
        });
    }
 
    /**
     * 移除。
     *
     * @author Helsing
     * @date 2020/1/18
     */
     remove(entityId = undefined) {
         setCss(this.element, "opacity", "0");
         setCss(this.element.querySelector("div:nth-child(1)"), "transition", "");
         setCss(this.element.querySelector("div:nth-child(2)"), "transition", "");
         setCss(this.element.querySelector("div:nth-child(1)"), "height", "0");
         setCss(this.element.querySelector("div:nth-child(2)"), "pointer-events", "none");
     };

     
    async mySampleTerrain(cartesian) {
        let terrainProvider = this.viewer.terrainProvider;
        let cartographic = Cartographic.fromCartesian(cartesian);
        let promise = sampleTerrainMostDetailed(terrainProvider, [cartographic]);
        return promise;
    };
    async myClampToHeigh(cartesian) {
        let promise = this.viewer.scene.clampToHeightMostDetailed([cartesian]);
        return promise;
    };
}
 
export default InfoTool;