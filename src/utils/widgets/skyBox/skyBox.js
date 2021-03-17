// InfoTool.js
// ====================
// 引入模块
// ====================
import Viewer from "@/../node_modules/cesium/Source/Widgets/Viewer/Viewer.js";
import SkyBox from "@/../node_modules/cesium/Source/Scene/SkyBox.js";
import Cesium3DTileFeature from "@/../node_modules/cesium/Source/Scene/Cesium3DTileFeature.js";
// import Cesium3DTile from "@/../node_modules/cesium/Source/Scene/Cesium3DTile.js";
import Cartesian2 from "@/../node_modules/cesium/Source/Core/Cartesian2.js";
import Cartesian3 from "@/../node_modules/cesium/Source/Core/Cartesian3.js";
import Cartographic from "@/../node_modules/cesium/Source/Core/Cartographic.js";
import sampleTerrainMostDetailed from "@/../node_modules/cesium/Source/Core/sampleTerrainMostDetailed.js"
import when from "@/../node_modules/cesium/Source/ThirdParty/when.js"
import SceneTransforms from "@/../node_modules/cesium/Source/Scene/SceneTransforms.js";
import defined from "@/../node_modules/cesium/Source/Core/defined.js";
import { setCss, getCss, setInnerText, getGuid} from "@/utils//util.js";

// ====================
// 类
// ====================
/**
* 信息工具。
*
* @author 
* @date 2019/12/22
* @alias SkyBox
* @constructor
* @param {Viewer} viewer Cesium视窗。
*/
class DSkyBox {
    constructor(viewer) {
        this.viewer = viewer;
    }

    /**
     * @description: 
     * @param {*}
     * @return {*}
     */
    sunny(){
        let sunnySkyBox = new SkyBox({
            // nearGround:true,
            sources: {
                positiveX: '@/assets/skybox/posx.png',
                negativeX: '@/assets/skybox/negx.png',
                positiveY: '@/assets/skybox/posy.png',
                negativeY: '@/assets/skybox/negy.png',
                positiveZ: '@/assets/skybox/posz.png',
                negativeZ: '@/assets/skybox/negz.png'

            }
        });
        this.viewer.scene.skyBox = sunnySkyBox;
    }
 

 
}
 
export default DSkyBox;