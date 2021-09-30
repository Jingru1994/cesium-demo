import Cartesian3 from "cesium/Core/Cartesian3.js";
import Matrix4 from "cesium/Core/Matrix4.js";
import EllipsoidTerrainProvider from "cesium/Core/EllipsoidTerrainProvider.js";
import Cartographic from "cesium/Core/Cartographic.js";
import Cesium3DTileset from "cesium/Scene/Cesium3DTileset.js";
import sampleTerrainMostDetailed from "cesium/Core/sampleTerrainMostDetailed.js";
import HeadingPitchRange from "cesium/Core/HeadingPitchRange.js";
import ShadowMode from "cesium/Scene/ShadowMode.js"


/**
* 信息工具。
*
* @author Dongjingru
* @date 2021/09/26
* @alias Photogrammetry
* @constructor
* @param {Object} options 参数
*/
class Photogrammetry {
 
    /**
    * 创建一个Div地物标志。
    *
    * @param {Object} options 选项。
    * @param {String} options.url 摄影测量模型url地址
    * @param {Function} [options.readyPromise] 加载完成回调函数
    * @param {Object} [options.inhereOptions] Cesium3DTileset原始参数
    * 
    
    */
    constructor(options) {
        if(!options) {
            throw Error('Creating Photogrammetry instance must provide options');
        }
        const tileOptions = {
            url: options.url,
            shadows: ShadowMode.DISABLED
        }
        const inhereOptions = options.inhereOptions;
        if(inhereOptions) {
            Object.assign(tileOptions, inhereOptions);
        }
        const tileset = new Cesium3DTileset(tileOptions);
        this.tileset = tileset;
        this.readyPromise = options.readyPromise;
    }
    /**
    * 将摄影测量模型添加到viewer中显示。
    *
    * @param {Viewer} viewer 将添加模型的地图viewer
    * @ignore
    */
    async addTo(viewer) {
        if(!viewer) return;
        this.viewer = viewer;
        const tileset = await this.getTiles();
        const boundingSphere = tileset.boundingSphere;
        const terrainCartesian = await this.getSurfaceHeight(boundingSphere.center);
        const model = boundingSphere.center;
        const surface = terrainCartesian;
        const translation = Cartesian3.subtract(surface, model, new Cartesian3());
        tileset.modelMatrix = Matrix4.fromTranslation(translation);

        this.viewer.zoomTo(tileset, new HeadingPitchRange(0.0, -0.6, tileset.boundingSphere.radius*0.6));
        viewer.scene.primitives.add(this.tileset);
        typeof this.readyPromise === 'function' && this.readyPromise(tileset);
    }
    /**
     * 获取摄影测量模型
     * @return {Cesium3DTileset} 摄影测量模型
     */
    getElement() {
        return this.tileset;
    }
    /**
     * 销毁Photogrammetry实例
     */
    destroy() {
        if(!this.viewer.isDestroyed){
            this.tileset.destroy();
            console.log(this.tileset, 'tileset destroy');
        }
    }
    /**
     * 获取模型加载完成回调参数
     * @return {Cesium3DTileset} 摄影测量模型
     */
    async getTiles() {
        let tilePromise = await this.tileset.readyPromise;
        return tilePromise;
    }
    /**
     * 获取某经纬度的地表高度
     * @param {Cartesian3} cartesian 默认高度的笛卡尔坐标
     * @return {Cartesian3} 具有地表高度的笛卡尔坐标值
     */
    async getSurfaceHeight(cartesian) {
        let terrainProvider = this.viewer.terrainProvider;
        let cartographic = Cartographic.fromCartesian(cartesian);
        if(terrainProvider instanceof EllipsoidTerrainProvider) {
            cartographic = new Cartographic(cartographic.longitude, cartographic.latitude, 0);
            
        }else {
            cartographic = await this.sampleTerrain(cartographic);
            cartographic = cartographic[0];
        }
        const updatedCartesian = Cartographic.toCartesian(cartographic);
        return updatedCartesian;
    }
    /**
     * 获取某经纬度的地形高度
     * @param {Cartographic} cartesian 默认高度的笛卡尔坐标
     * @return {Array} 具有地表高度的弧度经纬度坐标值列表，列表只含一个值
     */
    async sampleTerrain(cartographic) {
        let terrainProvider = this.viewer.terrainProvider;
        let promise = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);
        return promise
    }
}
 
export default Photogrammetry;