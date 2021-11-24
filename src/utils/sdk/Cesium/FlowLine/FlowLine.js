import Primitive from "cesium/Scene/Primitive.js";
import GroundPolylinePrimitive from "cesium/Scene/GroundPolylinePrimitive.js";
import GeometryInstance from "cesium/Core/GeometryInstance.js";
import PolylineGeometry from "cesium/Core/PolylineGeometry.js";
import GroundPolylineGeometry from "cesium/Core/GroundPolylineGeometry.js";
import PolylineMaterialAppearance from "cesium/Scene/PolylineMaterialAppearance.js";
import Material from "cesium/Scene/Material.js";
import "./PolylineFlowMaterial.js";
import Color from "cesium/Core/Color.js";
import PrimitiveCollection from "cesium/Scene/PrimitiveCollection.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";

/**
 * 流动线
 *
 * @author Dongjingru
 * @alias FlowlinePrimitive
 * @constructor
 * @param {Object} options 参数
 */
class FlowLine {
  /**
   * 创建流动线。
   *
   * @param {Object} options 选项。
   * @param {Array} options.positions 线段节点列表。
   * @param {Number} [options.width] 线宽。
   * @param {Boolean} [options.clampToGround] 线段是否贴地。
   * @param {Object} [options.style] 线段样式。
   * @param {Cesium.Color} [options.style.color] 线段颜色。
   * @param {Number} [options.style.speed] 线段速度。
   * @param {Number} [options.style.percent] 线段高亮部分百分比。
   * @param {Number} [options.style.gradient] 线段透明度。
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating FlowLine instance must provide options");
    }
    const clampToGround =
      options.clampToGround !== "undefined" ? options.clampToGround : true; //默认值为true
    // const clampToGround = options.clampToGround || false; //默认值为false
    this._positions = FlowLine.processData(options.positions);
    this._width = Number(options.width) || 5;

    if (clampToGround) {
      let polyline = new GroundPolylineGeometry({
        positions: this._positions,
        width: this._width
      });
      this._primitive = new GroundPolylinePrimitive({
        geometryInstances: new GeometryInstance({
          geometry: polyline
        })
      });
    } else {
      let polyline = new PolylineGeometry({
        positions: this._positions,
        width: this._width
      });
      this._primitive = new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: polyline
        })
      });
    }
    const style = options.style;
    this.setAppearance(style);
  }

  set show(show) {
    this._primitive.show = show;
    return this;
  }

  get show() {
    return this._primitive.show;
  }

  set positions(positions) {
    this._primitive.geometryInstances.geometry = new PolylineGeometry({
      positions: positions,
      width: this._width
    });
    return this;
  }

  get positions() {
    return this._positions;
  }
  static processData(data) {
    const roadNodes = data;
    let cartesians = [];
    roadNodes.forEach(node => {
      cartesians.push(node[0]);
      cartesians.push(node[1]);
    });
    cartesians = Cartesian3.fromDegreesArray(cartesians);
    return cartesians;
  }
  setAppearance(style) {
    this._primitive.appearance = new PolylineMaterialAppearance({
      material: Material.fromType("PolylineFlow", {
        color: style?.color || new Color(1.0, 0.0, 0.0, 0.7),
        speed: style?.speed || 1,
        percent: style?.percent || 0.03,
        gradient: style?.gradient || 0.1
      })
    });
  }
  setStyle(style = {}) {
    if (Object.keys(style).length === 0) {
      return this;
    }
    this.setAppearance(style);
    return this;
  }
  addTo(container) {
    if (!container) return;
    if (container instanceof PrimitiveCollection) {
      container.add(this._primitive);
    } else {
      container.scene.primitives.add(this._primitive);
    }
  }
}

export default FlowLine;
