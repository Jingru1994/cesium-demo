import Cartesian2 from "cesium/Core/Cartesian2.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import Cartographic from "cesium/Core/Cartographic.js";
import sampleTerrainMostDetailed from "cesium/Core/sampleTerrainMostDetailed.js";
import defined from "cesium/Core/defined.js";
import HeightType from "../HeightType/HeightType";
import "./divGraphic.css";
import HorizontalReference from "../HorizontalReference/HorizontalReference";
import VerticalReference from "../VerticalReference/VerticalReference";

/**
 * 信息工具。
 *
 * @author Dongjingru
 * @date 2021/09/18
 * @alias divGraphic
 * @constructor
 * @param {Object} options 参数
 */
class DivGraphic {
  /**
   * 创建一个Div地物标志。
   *
   * @param {Object} options 选项。
   * @param {Array} options.position 位置[经度，纬度，高度]。
   * @param {HeightType} options.heightType 高度类型。
   * @param {String} options.html 地物标志div内容
   * @param {VerticalReference} [options.verticalReference] 垂直方向原点位置
   * @param {HorizontalReference} [options.horizontalReference] 水平方向原点位置
   * @param {Number} [options.xOffset=0] 地物标志水平偏移量。
   * @param {Number} [options.yOffset=0] 地物标志垂直偏移量。
   * @param {Function} [options.clickEvent] 地物标志点击事件
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating divGraphic instance must provide options");
    }
    this.options = options;
    const html = options.html;
    const element = document.createElement("div");
    const clickEvent = options.clickEvent;
    element.id = "divMark_" + DivGraphic.getGuid(true);
    element.classList.add("hcr-cesium-div-mark");
    element.innerHTML = html;
    element.style.opacity = 0;
    this.element = element;
    DivGraphic.addEvents(element, clickEvent);
  }
  /**
   * 将Div地物标志添加到viewer中显示。
   *
   * @param {Viewer} viewer 将添加div地物标志的地图viewer
   * @ignore
   */
  async addTo(viewer) {
    if (!viewer) return;
    this.viewer = viewer;
    const container = viewer.container;
    let divGraphicContainer = document.querySelector(".hcr-cesium-divlayer");
    if (!divGraphicContainer) {
      divGraphicContainer = document.createElement("div");
      divGraphicContainer.classList.add("hcr-cesium-divlayer");
      container.appendChild(divGraphicContainer);
    }
    divGraphicContainer.appendChild(this.element);
    this.divGraphicContainer = divGraphicContainer;

    const inPosition = this.options.position;
    const heightType = this.options.heightType;
    const divPosition = await DivGraphic.getHeight(
      inPosition,
      heightType,
      viewer
    );

    this.element.style.opacity = 1;
    const offset = DivGraphic.getOffset(this.element, this.options);

    DivGraphic.hookToGlobe(viewer, this.element, divPosition, offset, true);
    // viewer.scene.requestRender();
  }
  /**
   * 获取地物标志的div元素
   * @return {Element} div元素
   */
  getElement() {
    return this.element;
  }
  /**
   * 移除该div元素并移除事件绑定
   */
  destroy() {
    console.log("divgraphic destroy");
    this.element.removeEventListener("click", DivGraphic.clickEvent);
    this.viewer.scene.preRender.removeEventListener(DivGraphic.moveElement);
    this.divGraphicContainer.removeChild(this.element);
  }
  /**
   * div元素点击事件绑定
   *
   * @param {Element} element 弹窗元素。
   * @param {Func} callback div点击事件的回调函数。
   */
  static addEvents(element, callback) {
    element.addEventListener("click", DivGraphic.clickEvent(callback));
  }
  /**
   * div元素点击事件绑定的方法
   *
   * @param {Func} callback div点击事件的回调函数。
   */
  static clickEvent(callback) {
    return function curried_func() {
      typeof callback === "function" && callback();
    };
  }
  /**
   * 获取div元素偏移量
   *
   * @param {Element} element 弹窗元素。
   * @param {Object} options 创建DivGraphic实例传入参数。
   * @return {Array} div元素偏移量
   */
  static getOffset(element, options) {
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const verticalReference =
      options.verticalReference || VerticalReference.BOTTOM;
    const horizontalReference =
      options.horizontalReference || HorizontalReference.LEFT;
    const xOffset = options.xOffset || 0;
    const yOffset = options.yOffset || 0;
    let offset = [0, 0];
    switch (horizontalReference) {
      case HorizontalReference.LEFT:
        offset[0] = 0;
        break;
      case HorizontalReference.RIGHT:
        offset[0] = -width;
        break;
      case HorizontalReference.CENTER:
        offset[0] = -width / 2;
        break;
    }
    switch (verticalReference) {
      case VerticalReference.BOTTOM:
        offset[1] = -height;
        break;
      case VerticalReference.TOP:
        offset[1] = 0;
        break;
      case VerticalReference.CENTER:
        offset[1] = -height / 2;
        break;
    }
    offset[0] = offset[0] + xOffset;
    offset[1] = offset[1] + yOffset;
    return offset;
  }
  /**
   * 根据经纬度及高度类型获取div显示高度
   *
   * @param {Array} inPosition 位置[经度，纬度，[高度]]。
   * @param {HeightType} heightType 高度类型
   * @param {Viewer} viewer 获取点位高度的viewer
   * @return {Cartesian3} 获取高度后的笛卡尔坐标
   */
  static async getHeight(inPosition, heightType, viewer) {
    let position = Cartesian3.fromDegrees(...inPosition);
    switch (heightType) {
      case HeightType.NONE:
        // position = position;
        break;
      case HeightType.TERRAIN:
        position = await DivGraphic.mySampleTerrain(position, viewer);
        position = position[0];
        position = Cartographic.toCartesian(position);
        break;
      case HeightType.TILES:
        position = await DivGraphic.myClampToHeigh(position, viewer);
        position = position[0];
        break;
      case HeightType.RELATIVE_TO_TERRAIN:
        position = await DivGraphic.mySampleTerrain(position, viewer);
        position = position[0];
        position = new Cartographic(
          position.longitude,
          position.latitude,
          position.height + inPosition[2]
        );
        position = Cartographic.toCartesian(position);

        break;
      case HeightType.RELATIVE_TO_TILES:
        position = await DivGraphic.myClampToHeigh(position, viewer);
        position = position[0];
        position = Cartographic.fromCartesian(position);
        position = new Cartographic(
          position.longitude,
          position.latitude,
          position.height + inPosition[2]
        );
        position = Cartographic.toCartesian(position);
        break;
    }
    return position;
  }
  /**
   * 将HTML弹窗挂接到地球上。
   *
   * @param {Viewer} viewer Cesium视窗。
   * @param {Element} element 弹窗元素。
   * @param {Cartesian3} position 地图坐标点。
   * @param {Array} offset 偏移。
   * @param {Boolean} hideOnBehindGlobe 当元素在地球背面会自动隐藏，以减轻判断计算压力。
   */
  static hookToGlobe(viewer, element, position, offset, hideOnBehindGlobe) {
    const scene = viewer.scene,
      camera = viewer.camera;
    const cartesian2 = new Cartesian2();
    scene.preRender.addEventListener(
      DivGraphic.moveElement(
        scene,
        camera,
        cartesian2,
        element,
        position,
        offset,
        hideOnBehindGlobe
      )
    );
  }
  /**
   * Viewer重绘事件绑定的移动div元素方法。
   *
   * @param {Scene} scene Cesium视窗Viewer的Scene。
   * @param {Camera} camera Cesium视窗Viewer的Scene。
   * @param {Cartesian3} cartesian2 存储屏幕坐标转换的世界笛卡尔坐标
   * @param {Element} element 弹窗元素。
   * @param {Cartesian3} position 地图坐标点。
   * @param {Array} offset 偏移。
   * @param {Boolean} hideOnBehindGlobe 当元素在地球背面会自动隐藏，以减轻判断计算压力。
   */
  static moveElement(
    scene,
    camera,
    cartesian2,
    element,
    position,
    offset,
    hideOnBehindGlobe
  ) {
    return function curried_func() {
      const canvasPosition = scene.cartesianToCanvasCoordinates(
        position,
        cartesian2
      ); // 笛卡尔坐标到画布坐标
      if (defined(canvasPosition)) {
        element.style.left = parseInt(canvasPosition.x + offset[0]) + "px";
        element.style.top = parseInt(canvasPosition.y + offset[1]) + "px";

        // 是否在地球背面隐藏
        if (hideOnBehindGlobe) {
          const cameraPosition = camera.position;
          let height = scene.globe.ellipsoid.cartesianToCartographic(
            cameraPosition
          ).height;
          height += scene.globe.ellipsoid.maximumRadius;
          if (!(Cartesian3.distance(cameraPosition, position) > height)) {
            element.style.display = "flex";
          } else {
            element.style.display = "none";
          }
        }
      }
    };
  }
  /**
   * 根据经纬度获取具有地形高度的地理弧度坐标
   *
   * @param {Cartesian3} cartesian 点位的笛卡尔坐标
   * @param {Viewer} viewer 获取点位高度的viewer
   * @return {Cartographic} 获取高度后的地理弧度坐标
   */
  static async mySampleTerrain(cartesian, viewer) {
    let terrainProvider = viewer.terrainProvider;
    let cartographic = Cartographic.fromCartesian(cartesian);
    let promise = sampleTerrainMostDetailed(terrainProvider, [cartographic]);
    return promise;
  }
  /**
   * 根据经纬度获取具有3dtiles高度的笛卡尔坐标
   *
   * @param {Cartesian3} cartesian 点位的笛卡尔坐标
   * @param {Viewer} viewer 获取点位高度的viewer
   * @return {Cartesian3} 获取高度后的笛卡尔坐标
   */
  static async myClampToHeigh(cartesian, viewer) {
    let promise = viewer.scene.clampToHeightMostDetailed([cartesian]);
    return promise;
  }
  /**
   * 获取全球唯一ID。
   *
   * @param {Boolean} removeMinus 是否去除“-”号。
   * @returns {String} GUID。
   */
  static getGuid(removeMinus) {
    let d = new Date().getTime();
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
      c
    ) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    if (removeMinus) {
      uuid = uuid.replace(/-/g, "");
    }
    return uuid;
  }
}

export default DivGraphic;
