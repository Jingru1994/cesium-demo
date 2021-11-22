import SkyBox from "cesium/Scene/SkyBox.js";
import buildModuleUrl from "cesium/Core/buildModuleUrl";
import Cartographic from "cesium/Core/Cartographic.js";
import SkyBoxOnGround from "./SkyBoxOnGround.js";
import SkyboxType from "../SkyboxType/SkyboxType.js";
import SkyboxImageSources from "./SkyboxImageSources.js";

/**
 * 自定义近地天空盒
 *
 * @author
 * @alias SkyBox
 * @constructor
 * @param {Object} options 参数
 */
class CustomSkyBox {
  /**
   * 创建近地天空盒。
   *
   * @param {Object} options 选项。
   * @param {SkyboxType} [options.type] 使用自定义天空盒中的预定义样式类型。
   * @param {Object} [options.sources] 天空盒图片列表。
   * @param {String} [options.sources.positiveX] 天空盒右侧图片地址。
   * @param {String} [options.sources.negativeX] 天空盒左侧图片地址。
   * @param {String} [options.sources.positiveY] 天空盒前面图片地址。
   * @param {String} [options.sources.negativeY] 天空盒后面图片地址。
   * @param {String} [options.sources.positiveZ] 天空盒顶部图片地址。
   * @param {String} [options.sources.positiveZ] 天空盒底部图片地址。
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating CustomSkyBox instance must provide options");
    }
    let imageSources = undefined;
    if (options.type) {
      const type = options.type;
      switch (type) {
        case SkyboxType.SUNNY:
          imageSources = SkyboxImageSources.SUNNY;
          break;
        case SkyboxType.DUSK:
          imageSources = SkyboxImageSources.DUSK;
      }
    }
    if (options.sources) {
      imageSources = options.sources;
    }
    this.handler = {};
    this.createSkybox(imageSources);
  }
  createSkybox(imageSources) {
    let customSkybox = new SkyBoxOnGround({ sources: imageSources });
    let defaultSkybox = new SkyBox({
      sources: {
        positiveX: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_px.jpg"),
        negativeX: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mx.jpg"),
        positiveY: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_py.jpg"),
        negativeY: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_my.jpg"),
        positiveZ: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_pz.jpg"),
        negativeZ: buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mz.jpg")
      }
    });
    this.customSkybox = customSkybox;
    this.defaultSkybox = defaultSkybox;
    this.currentSkybox = this.customSkybox;
  }
  renderEvent(index, that) {
    return (
      this.handler[index] ||
      (this.handler[index] = function() {
        let e = that.viewer.camera.position;
        if (Cartographic.fromCartesian(e).height < 3000) {
          that.currentState = "custom";
        } else {
          that.currentState = "default";
        }
        if (that.currentState !== that.oldState) {
          console.log("change");
          if (that.currentState === "custom") {
            that.viewer.scene.skyBox = that.customSkybox;
            that.viewer.scene.skyAtmosphere.show = false;
            that.oldState = "custom";
          } else {
            that.viewer.scene.skyBox = that.defaultSkybox;
            that.viewer.scene.skyAtmosphere.show = true;
            that.oldState = "default";
          }
        }
      })
    );
  }
  changeSkybox() {}
  setTo(viewer) {
    if (!viewer) return;
    viewer.scene.skyBox = this.customSkybox;
    this.viewer = viewer;
    viewer.scene.postRender.addEventListener(
      this.renderEvent("postRender", this)
    );
  }
  destroy() {
    this.viewer.scene.skyBox = this.defaultSkybox;
    this.viewer.scene.skyAtmosphere.show = true;
    this.customSkybox = null;
    this.viewer.scene.postRender.removeEventListener(
      "postRender",
      this.renderEvent("postRender")
    );
  }
}

export default CustomSkyBox;
