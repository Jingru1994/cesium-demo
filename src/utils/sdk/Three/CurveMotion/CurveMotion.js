import LineBezierCurve3 from "../LineBezierCurve3/LineBezierCurve3.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

/**
 * 沿轨迹移动模型
 *
 * @author Dongjingru
 * @alias CurveMotion 沿轨迹移动模型
 * @constructor
 */
class CurveMotion {
  /**
   *CurveMotion构造函数
   *
   * @param {Object} options
   * @param {Array} options.nodes 路径点集合[x,y,z]，至少两个
   * @param {THREE.Mesh} options.object 移动物体
   * @param {Boolean} [options.speed] 物体移动速度，取值范围为0-1。
   * @param {Boolean} [options.closed] 路径是否自动闭合，默认为false
   * @param {Number} [options.radius] 路径转角半径
   * @param {Boolean} [options.infinity] 是否一直循环
   * @param {Boolean} [options.showLine] 是否显示轨迹线，默认显示
   * @param {Object} [options.lineStyle] 线材质
   * @param {String} [options.lineStyle.color] 线颜色
   * @param {Number} [options.lineStyle.lineWidth] 线宽度
   * @param {Boolean} [options.lineStyle.transparent] 线是否透明
   * @param {Number} [options.lineStyle.opacity] 线透明度
   * @param {Boolean} [options.lineStyle.dashed] 是否为虚线
   * @param {Number} [options.lineStyle.dashSize] 虚线长度
   * @param {Number} [options.lineStyle.gapSize] 间隔长度
   * @param {Number} [options.lineStyle.dashOffset] 虚线偏移量
   * @param {Number} [options.lineStyle.dashScale] 虚线密度
   *
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating CurveMotion instance must provide options");
    }
    const curve = new LineBezierCurve3(
      options.nodes,
      options.closed,
      options.radius
    );
    this.curve = curve;
    this.object = options.object;
    this.showLine =
      typeof options.showLine !== "undefined" ? options.showLine : true;
    if (this.showLine) {
      const line = this.createLine(options.lineStyle);
      this.line = line;
    }
    this.infinity = options.infinity || false;
    this.t = 0;
    this.speed =
      (options.speed && Math.min(Math.max(options.speed, 0), 1)) || 0.005;

    this.positions = [];
    this.animate();
  }
  createLine(lineStyle) {
    let geometry = new LineGeometry();
    const materailOptions = {
      color: "rgb(255,255,255)",
      linewidth: 1
    };
    if (lineStyle) {
      Object.assign(materailOptions, lineStyle);
    }
    const material = new LineMaterial(materailOptions);
    material.resolution.set(window.innerWidth, window.innerHeight);
    const line = new Line2(geometry, material);
    return line;
  }
  extendLine() {
    if (this.t < 1) {
      this.point = this.curve.getPoint(this.t);
      if (this.showLine) {
        this.positions.push(this.point.x, this.point.y, this.point.z);
        let geometry = new LineGeometry();
        geometry.setPositions(this.positions);
        this.line.geometry = geometry;
      }

      this.object.position.copy(this.point);
      this.object.lookAt(this.curve.getPoint(this.t + this.speed / 2));
      this.t += this.speed;
    } else {
      if (this.infinity) {
        this.t = 0;
        this.positions = [];
      }
    }
  }
  animate() {
    this.extendLine();
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  destroy() {
    cancelAnimationFrame(this.start);
    if (this.line) {
      this.line.geometry.dispose();
      this.line.material.dispose();
      this.line = null;
    }
    this.curve = null;
  }
}

export default CurveMotion;
