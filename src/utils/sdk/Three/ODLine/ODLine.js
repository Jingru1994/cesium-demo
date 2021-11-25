import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "./THREE.MeshLine.js";
import * as TWEEN from "@tweenjs/tween.js";

class ODLine {
  mesh;
  /**
   * ODLine构造函数
   *
   * @param {Object} options 选项。
   * @param {Array} options.lines 线段列表[{start:[经度，纬度[，高度]],end:[经度，纬度[，高度]]},...]
   * @param {Element} options.dom canvas容器
   * @param {Object} options.style 线样式
   * @param {Boolean} options.style.isHalf 高亮区域形状
   * @param {Number} options.style.length 高亮部分在飞线总长度占比
   * @param {Number} options.style.lineWidth 线宽
   * @param {Color} options.style.color 线颜色，只设置一个颜色，line和light是同一色系颜色
   * @param {Color} options.style.lineColor 线颜色，不设置color时，可分别设置line和light颜色
   * @param {Color} options.style.lightColor 高亮颜色
   * @param {Number} options.style.duration 单个动画持续时间
   * @param {Number} options.style.delay 动画之间延迟
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating ODLine instance must provide options");
    }
    const processedLines = this.processData(options.lines);
    this.computeDistanceRange(processedLines);

    const material = this.createODLineMaterial(options.style, options.dom);

    const group = new THREE.Group();
    for (const line of processedLines) {
      const points = this.createCubicBezierPoints(line.start, line.end);
      const mesh = this.createODLine(points, material);
      group.add(mesh);
    }
    this.mesh = group;

    let duration = options.style.duration || 3000;
    let delay = options.style.delay || 0;
    const tween = new TWEEN.Tween(material.uniforms.offset.value);
    tween
      .to({ x: material.uniforms.offset.value.x - 1 }, duration)
      .delay(delay)
      .repeat(Infinity)
      .start();
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  computeDistanceRange(lines) {
    let distances = [];
    for (const line of lines) {
      distances.push(line.start.distanceTo(line.end));
    }
    let maxDistance = Math.max(...distances);
    let minDistance = Math.min(...distances);
    this.maxVal = maxDistance;
    this.minVal = minDistance;
  }
  processData(lines) {
    const newLines = [];
    let newLine = {};
    debugger;
    for (const line of lines) {
      newLine = {};
      newLine.start = new THREE.Vector3(
        line.start[0],
        line.start[1],
        line.start[2] || 0
      );
      newLine.end = new THREE.Vector3(
        line.end[0],
        line.end[1],
        line.end[2] || 0
      );
      newLines.push(newLine);
    }
    return newLines;
  }
  smoothStep(x) {
    let minVal = this.minVal;
    let maxVal = this.maxVal;
    let t = this.clamp((x - minVal) / (maxVal - minVal), 0, 1);
    return t * t * (3 - 2 * t);
  }
  clamp(x, minVal, maxVal) {
    return Math.min(Math.max(x, minVal), maxVal);
  }
  createCubicBezierPoints(startPoint, endPoint) {
    let v0, v1, v2, v3;
    // let n;
    v0 = startPoint;
    v3 = endPoint;
    const distance = v0.distanceTo(v3);
    let height = (this.smoothStep(distance) * this.maxVal) / 4;
    v1 = new THREE.Vector3(
      (v3.x - v0.x) / 3 + v0.x,
      (v3.y - v0.y) / 3 + v0.y,
      v0.z + height
    ); //只要考虑xy坐标，z直接给个高度就行
    v2 = new THREE.Vector3(
      ((v3.x - v0.x) / 3) * 2 + v0.x,
      ((v3.y - v0.y) / 3) * 2 + v0.y,
      v3.z + height
    );
    const curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
    const points = curve.getPoints(500);
    return points;
  }
  createODLine(points, material) {
    let verticesList = [];
    points.forEach(item => {
      verticesList.push(item.x);
      verticesList.push(item.y);
      verticesList.push(item.z);
    });
    const vertices = new Float32Array(verticesList);
    debugger;
    const meshline = new MeshLine();
    meshline.setPoints(vertices);
    const mesh = new THREE.Mesh(meshline, material);
    return mesh;
  }
  createODLineMaterial(options, dom) {
    let length = options.length || 0.1;
    let lineColor = options.lineColor || "rgba(255,255,255,0.2)";
    let lightColor = options.lightColor || "rgba(255,255,255,1)";
    let isHalf = typeof options.isHalf !== "undefined" ? options.isHalf : true;
    let lineWidth = options.lineWidth || 2;
    let color = options.color || new THREE.Color("rgb(255, 255, 255)");
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 256, 1);
    gradient.addColorStop(0, lineColor);
    gradient.addColorStop(isHalf ? length : length / 2, lightColor);
    gradient.addColorStop(length, lineColor);
    gradient.addColorStop(length, lineColor);
    gradient.addColorStop(1, lineColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const material = new MeshLineMaterial({
      map: texture, // 材质
      useMap: true, // 使用材质
      lineWidth: lineWidth, // 线宽
      sizeAttenuation: false, // 是否随距离衰减
      transparent: true, // 开启透明度
      color: color
    });

    const width = dom.width;
    const height = dom.height;
    material.uniforms.resolution.value.set(width, height);
    return material;
  }
  animate() {
    this.start = requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }
  stop() {
    if (this.start) {
      cancelAnimationFrame(this.start);
    }
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
  destroy() {
    this.stop();
    this.mesh.traverse(item => {
      if (item.isMesh) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
          });
        } else {
          item.material.dispose();
        }
      }
    });
    this.mesh = null;
  }
}

export default ODLine;
