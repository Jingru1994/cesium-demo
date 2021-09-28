import Ion from "cesium/Core/Ion.js";
import UrlTemplateImageryProvider from "cesium/Scene/UrlTemplateImageryProvider.js";
import CesiumTerrainProvider from "cesium/Core/CesiumTerrainProvider.js";
import createWorldTerrain from "cesium/Core/createWorldTerrain.js";
import Viewer from "cesium/Widgets/Viewer/Viewer.js";

/**
* 信息工具。
*
* @author Dongjingru
* @date 2021/09/24
* @alias MyViewer
* @constructor
* @param {Object} options 参数
*/
class MyViewer {
 
    /**
    * 创建一个Div地物标志。
    *
    * @param {Object} options 选项。
    * @param {Element | String} options.container 包含Viewer组件的DOM元素或ID
    * @param {String} options.IonToken Cesium Ion访问令牌
    * @param {Boolean} [options.showTerrain] 是否显示地形，默认为false
    * @param {String} [options.imageryUrl] 影像服务url地址
    * @param {String} [options.terrainUrl] 地形服务url地址
    * @param {Object} [options.inhereOptions] Cesium.Viewer原始参数
    * 
    */
    constructor(options) {
        if(!options) {
            throw Error('Creating Viewer instance must provide options')
        }
        Ion.defaultAccessToken = options.IonToken;
        let viewerOption = {
            geocoder: false, // 地理位置查询定位控件
            homeButton: false, // 默认相机位置控件
            timeline: false, // 时间滚动条控件
            navigationHelpButton: false, // 默认的相机控制提示控件
            fullscreenButton: false, // 全屏控件
            scene3DOnly: true, // 每个几何实例仅以3D渲染以节省GPU内存
            baseLayerPicker: false, // 底图切换控件
            animation: false, // 控制场景动画的播放速度控件,
            infoBox: false,
            selectionIndicator: false,//去除原生自带绿色选择框
        };
        if(options.imageryUrl) {
            const imageryProvider = new UrlTemplateImageryProvider({
                url: options.imageryUrl
            });
            const imageryOptions = {
                imageryProvider: imageryProvider
            };
            Object.assign(viewerOption, imageryOptions);
        }
        if(options.showTerrain || false) {
            let terrainProvider;
            if(options.terrainUrl) {
                terrainProvider = new CesiumTerrainProvider({
                    url: options.terrainUrl
                });
            }else {
                terrainProvider = new createWorldTerrain();
            }
            const terrainOptions = {
                terrainProvider: terrainProvider
            };
            Object.assign(viewerOption, terrainOptions);
        }
        const inhereOptions = options.inhereOptions;
        Object.assign(viewerOption, inhereOptions);

        const viewer = new Viewer(options.container, viewerOption);
        viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
        viewer.scene.primitives.destroyPrimitives= false;//若不设置为false，移除primitives时会报错，停止渲染
        
        //光照、雾、阴影
        viewer.scene.fog.enabled = false;
        viewer.scene.globe.enableLighting = true;
        viewer.shadows = true;

        viewer.scene.globe.depthTestAgainstTerrain = true;//不设置立体entity无法贴地

        this.viewer = viewer;
    }
    /**
     * 获取Viewer组件
     * @return {Viewer} Viwer实例
     */
    getElement() {
        return this.viewer;
    }
    /**
     * 销毁MyViewer实例
     */
    destroy() {
        if(this.viewer) {
            if(!this.viewer.isDestroyed()){
                this.viewer.dataSources.removeAll(true);
                this.viewer.entities.removeAll();
                this.viewer.scene.primitives.removeAll();
                this.viewer.destroy();
                console.log('viewer destroy');
            }
            this.viewer = null;
        }
    }
}
 
export default MyViewer;