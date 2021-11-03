import Entity from "cesium/DataSources/Entity";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import Color from "cesium/Core/Color.js";
import ScrollWallMaterialProperty from "./ScrollWallMaterialProperty.js";
import EntityCollection from "cesium/DataSources/EntityCollection.js";

/**
 * 流动线
 *
 * @author Dongjingru
 * @alias FlowlinePrimitive
 * @constructor
 * @param {Object} options 参数
 */
class ScrollWall {
  /**
   * 创建滑动纹理墙。
   *
   * @param {Object} options 选项。
   * @param {Array} options.positions 墙节点坐标列表。
   * @param {Number} options.height 墙的高度。
   * @param {String} [options.color] 墙的颜色，css颜色字符。
   * @param {Number} [options.speed] 墙透明度及纹理滑动速度。
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating SlideImageWall instance must provide options");
    }
    const height = Number(options.height) || 100;
    const materialOptions = {
      color: options.color,
      speed: options.speed
    };
    const positions = ScrollWall.processData(options.positions, height);
    const material = ScrollWall.createMaterial(materialOptions);
    const slideImageWall = ScrollWall.createEntity(positions, material);
    this.slideImageWall = slideImageWall;
  }
  set show(show) {
    this.slideImageWall.show = show;
    return this;
  }
  get show() {
    return this.slideImageWall.show;
  }
  static processData(data, height) {
    const edgeNodes = data;
    let cartesians = [];
    edgeNodes.forEach(node => {
      cartesians.push(node[0]);
      cartesians.push(node[1]);
      cartesians.push(height);
    });
    cartesians = Cartesian3.fromDegreesArrayHeights(cartesians);
    return cartesians;
  }
  static createEntity(positions, material) {
    const wall = new Entity({
      wall: {
        positions: positions,
        material: material,
        show: true
      }
    });
    return wall;
  }
  static createMaterial(options) {
    const color = options.color || "rgb(255, 0, 0)";
    const speed = options.speed || 1;
    const materialColor = Color.fromCssColorString(color);
    const material = new ScrollWallMaterialProperty({
      color: materialColor,
      speed: speed
    });
    return material;
  }

  addTo(container) {
    if (!container) return;
    if (container instanceof EntityCollection) {
      container.add(this.slideImageWall);
    } else {
      container.entities.add(this.slideImageWall);
    }
  }
}

export default ScrollWall;
