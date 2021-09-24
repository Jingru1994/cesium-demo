import Viewer from "cesium/Widgets/Viewer/Viewer.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import Matrix4 from "cesium/Core/Matrix4.js";
import EllipsoidTerrainProvider from "cesium/Core/EllipsoidTerrainProvider.js";
import Cartographic from "cesium/Core/Cartographic.js";
import Cesium3DTileset from "cesium/Scene/Cesium3DTileset.js"
import sampleTerrainMostDetailed from "cesium/Core/sampleTerrainMostDetailed.js"
import HeadingPitchRange from "cesium/Core/HeadingPitchRange.js"
import * as Cesium from "cesium/Cesium.js";

/**
* 信息工具。
*
* @author Dongjingru
* @date 2021/09/24
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
    * @param {Function} [options.readyPromise] 加载完成回调
    */
    constructor(options) {
        if(!options) {
            throw Error('Creating Photogrammetry instance must provide url')
        }
        const option = options.option;
        const tileset = new Cesium3DTileset(option);
        this.tileset = tileset;
        this.readyPromise = options.readyPromise;
    }
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

        this.viewer.zoomTo(tileset, HeadingPitchRange(0.1, -0.5, tileset.boundingSphere.radius*0.6));
        viewer.scene.primitives.add(this.tileset);
        typeof this.readyPromise === 'function' && this.readyPromise(tileset);
        
    }
    getElement(){
        return this.tileset;
    }
    async getTiles() {
        let tilePromise = await this.tileset.readyPromise;
        return tilePromise;
    }
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
    async sampleTerrain(cartographic) {
        let terrainProvider = this.viewer.terrainProvider;
        let promise = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);
        return promise
    }
}
 
export default Photogrammetry;