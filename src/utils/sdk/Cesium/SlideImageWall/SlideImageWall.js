import Entity from "cesium/DataSources/Entity";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import CallbackProperty from "cesium/DataSources/CallbackProperty.js";
import Color from "cesium/Core/Color.js";
import WallSlideImageMaterialProperty from "./WallSlideImageMaterialProperty.js";
import EntityCollection from "cesium/DataSources/EntityCollection.js";
import wallImage from "../Assets/Images/slideImageWall.png";
// const wallImage = require("../Assets/Images/slideImageWall.png");

/**
 * 流动线
 *
 * @author Dongjingru
 * @alias FlowlinePrimitive
 * @constructor
 * @param {Object} options 参数
 */
class SlideImageWall {
  /**
   * 创建滑动纹理墙。
   *
   * @param {Object} options 选项。
   * @param {Array} options.positions 墙节点坐标列表。
   * @param {Number} options.height 墙的高度。
   * @param {String} [options.image] 墙的纹理贴图。
   * @param {String} [options.color] 墙的颜色，css颜色字符。
   * @param {Number} [options.speed] 墙透明度及纹理滑动速度。
   * @param {Object} [options.repeat] 纹理重复模式。
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating SlideImageWall instance must provide options");
    }
    const height = Number(options.height) || 100;
    const materialOptions = {
      color: options.color,
      image: options.image,
      speed: options.speed,
      repeat: options.repeat
    };
    const positions = SlideImageWall.processData(options.positions, height);
    const material = SlideImageWall.createMaterial(materialOptions);
    const slideImageWall = SlideImageWall.createEntity(positions, material);
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
    const color = options.color || Color.fromBytes(255, 255, 255);
    const speed = options.speed || 1;
    const repeat = options.repeat || { x: 3, y: 1 };
    const image = options.image || wallImage;
    let alp = 1;
    let num = 0;
    const materialColor = Color.fromCssColorString(color);
    const material = new WallSlideImageMaterialProperty({
      image: image,
      color: new CallbackProperty(function() {
        if (num % 2 === 0) {
          alp -= 0.005;
        } else {
          alp += 0.005;
        }

        if (alp <= 0.3) {
          num++;
        } else if (alp >= 1) {
          num++;
        }
        return Color.fromAlpha(materialColor, alp);
      }, false),
      repeat: repeat,
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

export default SlideImageWall;
