// InfoTool.js
// ====================
// 引入模块
// ====================

import SkyBoxOnGround from "./SkyBoxOnGround.js";

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
class CustomSkyBox {
    constructor() {
    }

    /**
     * @description: 
     * @param {*}
     * @return {*}
     */
    static sunny(){
        let prefix = process.env.NODE_ENV === "production" ? process.env.BASE_URL : "";

        // let prefix = process.env.NODE_ENV === "production" ? window.location.pathname : "";
        // if(prefix !== ''){
        //     prefix = '/' + prefix.split('/')[1] + '/'
        // }
        // let prefix = process.env.BASE_URL;
        let sunnySkyBox = new SkyBoxOnGround({
            sources: {
                positiveX: prefix+'picture/skybox/sunny/posx.png',
                negativeX: prefix+'picture/skybox/sunny/negx.png',
                positiveY: prefix+'picture/skybox/sunny/posy.png',
                negativeY: prefix+'picture/skybox/sunny/negy.png',
                positiveZ: prefix+'picture/skybox/sunny/posz.png',
                negativeZ: prefix+'picture/skybox/sunny/negz.png'

            }
        });
        return sunnySkyBox;
    }
    static dusk(){
        let prefix = process.env.NODE_ENV === "production" ? process.env.BASE_URL : "";

        // let prefix = process.env.NODE_ENV === "production" ? window.location.pathname : "";
        // if(prefix !== ''){
        //     prefix = '/' + prefix.split('/')[1] + '/'
        // }
        // let prefix = process.env.BASE_URL;
        let duskSkyBox = new SkyBoxOnGround({
            sources: {
                positiveX: prefix+'picture/skybox/dusk/posx.png',
                negativeX: prefix+'picture/skybox/dusk/negx.png',
                positiveY: prefix+'picture/skybox/dusk/posy.png',
                negativeY: prefix+'picture/skybox/dusk/negy.png',
                positiveZ: prefix+'picture/skybox/dusk/posz.png',
                negativeZ: prefix+'picture/skybox/dusk/negz.png'

            }
        });
        return duskSkyBox;

        
    }
    static default(){
        let prefix = process.env.NODE_ENV === "production" ? process.env.BASE_URL : "";

        // let prefix = process.env.NODE_ENV === "production" ? window.location.pathname : "";
        // if(prefix !== ''){
        //     prefix = '/' + prefix.split('/')[1] + '/'
        // }
        // let prefix = process.env.BASE_URL;
        let duskSkyBox = new SkyBoxOnGround({
            sources: {
                positiveX: prefix+'Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
                negativeX: prefix+'Assets/Textures/SkyBox/tycho2t3_80_my.jpg',
                positiveY: prefix+'Assets/Textures/SkyBox/tycho2t3_80_mz.jpg',
                negativeY: prefix+'Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
                positiveZ: prefix+'Assets/Textures/SkyBox/tycho2t3_80_py.jpg',
                negativeZ: prefix+'Assets/Textures/SkyBox/tycho2t3_80_pz.jpg'

            }
        });
        return duskSkyBox;
    }
 

 
}
 
export default CustomSkyBox;