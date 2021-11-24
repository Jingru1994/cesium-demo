import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// var TWEEN = require('@tweenjs/tween.js')
const d3 = Object.assign(
  {},
  require("d3-scale"),
  require("d3-geo"),
  require("d3-array")
);

import PopupLegend from "@/utils/widgets/PopupLegend/PopupLegend.js";

class CylinderChart {
  mesh;
  material;
  /**
   * CylinderChart构造函数
   * 与CylinderChart1的区别是在控制是否显示弹窗时不会有dom元素的删除与添加，但是多出了很多全局变量
   *
   * @param {Object} options 阔散圆样式
   * @param {Vector3} options.data 数据
   * @param {Vector3} options.dataSeries 数据系列包括字段别称、字段名、图表颜色
   * @param {Number} options.title 图例标题相关数据
   * @param {Color} options.scene three场景
   * @param {Number} options.camera three相机
   * @param {Element} options.container three渲染dom元素
   * @param {Array} options.offset 圆柱体偏移量
   * @param {Number} cylinderRadius 圆柱半径
   * @param {Number} cylinderHeightScale 圆柱高度缩放比例
   * @param {Array} legendOffset 图例偏移量
   * @param {String} legendPanelColor 图例面板颜色
   * @param {Boolean} animate 是否有动态效果
   * @param {Number} animateDuration 动画时间
   *
   */
  constructor(options) {
    let data = options && options.data;
    let dataSeries = options && options.dataSeries;
    let title = options && options.title;
    let scene = options && options.scene;
    let camera = options && options.camera;
    let container = options && options.container;
    let offset = (options && options.offset) || [0, 0, 0];
    let cylinderRadius = (options && options.cylinderRadius) || 5;
    let cylinderHeightScale = (options && options.cylinderHeightScale) || 1;
    let legendOffset = (options && options.legendOffset) || [0, 0, 0];
    let legendPanelColor = (options && options.legendPanelColor) || null;
    let animate =
      (options && typeof options.animate !== "undefined"
        ? options.animate
        : true) || true;
    let duration = (options && options.animateDuration) || 1000;

    this._camera = camera;
    this._scene = scene;
    this._container = container;
    this._legendOffset = legendOffset;
    this._legendPanelColor = legendPanelColor;

    let mesh = new THREE.Group();

    for (let i = 0; i < data.length; i++) {
      let coordinate = data[i].geometry.coordinates;
      let dataDescription = [];
      let html = `${data[i].properties[title.name]}(${title.unit})<br/>`;
      let height = 0;
      dataSeries.forEach(function(item) {
        dataDescription.push({
          name: item.alias,
          value: data[i].properties[item.name],
          color: item.color
        });
        html += `<div style="height: 30px; line-height:30px;"><span style="color:${
          item.color
        }; font-size:20px">&#9679</span><span></span>${item.alias}：${
          data[i].properties[item.name]
        }</span></div>`;
        height += Number(data[i].properties[item.name]);
      });
      let materials = this.createMaterial(dataDescription);
      height = height * cylinderHeightScale;
      const geometry = new THREE.CylinderGeometry(
        cylinderRadius,
        cylinderRadius,
        height,
        32
      );
      const cylinder = new THREE.Mesh(geometry, materials);
      cylinder.rotation.x = Math.PI / 2;
      cylinder.position.set(
        coordinate[0] + offset.x,
        coordinate[1] + offset.y,
        height / 2 + offset.z
      );
      cylinder.html = html;
      cylinder.type = "cylinder";
      mesh.add(cylinder);
      if (animate) {
        const tween = new TWEEN.Tween({ scale: 0 });
        tween
          .to({ scale: 1 }, duration)
          .easing(TWEEN.Easing.Quartic.Out)
          .onUpdate(({ scale }) => {
            cylinder.scale.set(1, scale, 1);
            cylinder.position.set(
              coordinate[0] + offset[0],
              coordinate[1] + offset[1],
              (height / 2) * scale + offset[2]
            );
          })
          .start();
      }
    }
    this.mesh = mesh;
    this.createPopup();
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(dataDescription) {
    let canvas = this.createTexture(dataDescription);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const matetialBottom = new THREE.MeshPhongMaterial({
      color: dataDescription[dataDescription.length - 1].color
    });
    const matetialTop = new THREE.MeshPhongMaterial({
      color: dataDescription[0].color
    });
    return [material, matetialBottom, matetialTop];
  }
  createTexture(data) {
    const canvas = document.createElement("canvas");
    canvas.height = 500;
    canvas.width = 1;
    const y = d3
      .scalePow()
      .rangeRound([0, 500]) //与 canvas的height保持一致
      .domain([0, d3.sum(data.map(({ value }) => value))]);
    const ctx = canvas.getContext("2d");
    let left = 0;
    data.forEach(item => {
      const current = y(item.value);
      ctx.moveTo(0.5, 500 - left); //与 canvas的height保持一致
      ctx.lineTo(0.5, 500 - (left + current));
      left += current;
      ctx.lineWidth = 1;
      ctx.strokeStyle = item.color;
      ctx.stroke();
      ctx.beginPath();
    });

    return canvas;
  }
  createPopup() {
    const raycaster = new THREE.Raycaster();
    this._raycaster = raycaster;
    let selectedObject;
    this._selectedObject = selectedObject;
    // const container = document.querySelector('.three-view')
    let popup = new PopupLegend(
      this._scene,
      this._camera,
      this._container,
      this._legendPanelColor
    );
    this._popup = popup;
    let labelRenderer = popup.getCSS2DRenderer();
    this._labelRenderer = labelRenderer;
    const controls = new OrbitControls(this._camera, labelRenderer.domElement);
    this._controls = controls;
    controls.enableDamping = true;

    this.isPopup = true;
  }
  onPointerMove(event, that) {
    let mouse = new THREE.Vector2();
    if (event.isPrimary === false) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    that._raycaster.setFromCamera(mouse, that._camera);
    const intersects = that._raycaster.intersectObject(that.mesh, true);
    if (intersects.length > 0) {
      if (
        !that._selectedObject ||
        that._selectedObject !== intersects[0].object
      ) {
        that._selectedObject = intersects[0].object;
        that._popup
          .addTo(that._selectedObject)
          .setHtml(that._selectedObject.html)
          .setOffset(that._legendOffset);
      }
    } else {
      if (that._selectedObject) {
        that._popup.removeFrom(that._selectedObject);
      }
      that._selectedObject = null;
    }
  }
  openPopup() {
    const that = this;
    this._isPopup = true;

    this._labelRenderer.domElement.addEventListener(
      "mousemove",
      function _listener(e) {
        that.onPointerMove(e, that);
        if (!that._isPopup) {
          this.removeEventListener("mousemove", _listener);
        }
      }
    );
  }
  closePopup() {
    this._isPopup = false;
  }
  animate() {
    if (this._isPopup) {
      this._controls.update();
    }
    this.start = requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
  stop() {
    cancelAnimationFrame(this.start);
  }
}

export default CylinderChart;
