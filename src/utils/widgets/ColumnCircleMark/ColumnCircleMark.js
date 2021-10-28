import * as THREE from "three";
import GradientCircle from "@/utils/widgets/GradientCircle/GradientCircle.js";
import SpreadCircle from "@/utils/widgets/SpreadCircle/SpreadCircle.js";
// var TWEEN = require('@tweenjs/tween.js')

class ColumnCircleMark {
  mesh;
  material;
  start;
  /**
   * ColumnCircleMark构造函数
   *
   * @param {Object} options 地物mark样式
   * @param {Number} options.size mark高度
   * @param {String} options.text 标签文本
   * @param {Vector3} options.position 位置
   */
  constructor(options) {
    let mesh = new THREE.Group();

    let height = (options && options.size) || 1.5;
    let text = (options && options.text) || "label";
    let position = (options && options.position) || new THREE.Vector3(0, 0, 0);

    let gradientCircleOptions = {
      color: new THREE.Color("rgb(255,67,46)"),
      radius: height * 0.13 //0.2
    };
    let bottomCircle = new GradientCircle(gradientCircleOptions);

    let spreadCircleeOptions = {
      color: new THREE.Color("rgb(255,67,46)"),
      radius: height * 0.4, //0.5
      initRadius: height * 0.13, //0.2
      width: height * 0.13
    };
    let bottomSpreadCircle = new SpreadCircle(spreadCircleeOptions);

    let columnOptions = {
      height: height,
      color: new THREE.Color("rgb(247,147,89)")
    };
    let column = this.creatteColumn(columnOptions);

    let sqaureOptions = {
      color: new THREE.Color("rgb(247,147,89)"),
      size: height * 0.1,
      height: height * 0.98
    };
    let sqaure = this.createSqaure(sqaureOptions);

    let rippleCircleOptions = {
      color: new THREE.Color("rgb(255,255,255)"),
      radius: height * 0.53, //0.8
      initRadius: height * 0.53,
      height: height
    };
    // let rippleCircle = new RippleCircle(rippleCircleOptions)//从侧面看时锯齿严重,方案是一个Circle Geometry用shader画三个圆作为纹理
    // group.add(rippleCircle.mesh)  //开了抗锯齿也不行，边缘锯齿也很严重
    let rippleCircle = this.createRippleCircle(rippleCircleOptions); //三个Ring Geometry，波动效果通过直接在animate中改变材质的opacity实现

    let textOptions = {
      text: text,
      group: mesh,
      height: height * 1.06
    };
    // let label = this.createText(textOptions);
    this.createText(textOptions);

    mesh.add(
      bottomCircle.mesh,
      bottomSpreadCircle.mesh,
      column,
      sqaure,
      rippleCircle
    );
    mesh.position.copy(position);
    this.mesh = mesh;
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  creatteColumn(options) {
    let height = options.height;
    let color = options.color;
    let radius = options.height / 80;
    console.log(radius);

    let columnGoemetry = new THREE.CylinderGeometry(radius, radius, height, 32);
    let material = new THREE.MeshBasicMaterial({ color: color });
    let mesh = new THREE.Mesh(columnGoemetry, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(0, 0, height / 2);
    return mesh;
  }
  createSqaure(options) {
    let size = options.size;
    let color = options.color;
    let height = options.height;

    let sqaureGeometry = new THREE.PlaneGeometry(size, size);
    let material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    let mesh = new THREE.Mesh(sqaureGeometry, material);
    mesh.position.set(0, 0, height);
    return mesh;
  }
  createRippleCircle(options) {
    let height = options.height;
    let color = options.color;
    let radius = options.radius;
    let width1 = radius / 15,
      width2 = (radius / 15) * 0.7,
      width3 = (radius / 10) * 0.3;
    let interval = (radius - width1 - width2 - width3) / 3;

    const geometry1 = new THREE.RingGeometry(interval + width1, interval, 32);
    const geometry2 = new THREE.RingGeometry(
      interval * 2 + width1 + width2,
      interval * 2 + width1,
      32
    );
    const geometry3 = new THREE.RingGeometry(radius, radius - width3, 32);
    const material1 = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const material2 = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const material3 = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1
    });
    this.rippleCircleMaterial1 = material1;
    this.rippleCircleMaterial2 = material2;
    this.rippleCircleMaterial3 = material3;
    this.step = 0;

    let mesh1 = new THREE.Mesh(geometry1, material1);
    let mesh2 = new THREE.Mesh(geometry2, material2);
    let mesh3 = new THREE.Mesh(geometry3, material3);

    let mesh = new THREE.Group();
    mesh.position.set(0, 0, height);
    mesh.add(mesh1);
    mesh.add(mesh2);
    mesh.add(mesh3);
    this.rippleCircle = mesh;
    return mesh;
  }
  rippleCircleOpacityChange() {
    this.step += 0.03;
    this.rippleCircle.children[0].material.opacity =
      Math.abs(Math.sin(0.8 + this.step)) * 0.8;
    this.rippleCircle.children[1].material.opacity =
      Math.abs(Math.sin(0.4 + this.step)) * 0.8;
    this.rippleCircle.children[2].material.opacity =
      Math.abs(Math.sin(0.0 + this.step)) * 0.8;
  }
  createText(options) {
    let text = options.text;
    let group = options.group;
    let height = options.height;
    let loadedFont;
    let fontLoad = new THREE.FontLoader();
    fontLoad.load("threeFonts/fashionBold_Regular.json", response => {
      loadedFont = response;
      let textOptions = {
        font: loadedFont,

        size: height * 0.13,
        height: height * 0.013
      };
      let textGeometry = new THREE.TextGeometry(text, textOptions);
      let material1 = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(242,242,242)")
      });
      let material2 = new THREE.MeshBasicMaterial({
        color: new THREE.Color("rgb(220,220,220)")
      });
      let mesh = new THREE.Mesh(textGeometry, [material1, material2]);

      mesh.rotation.x = Math.PI / 2;
      textGeometry.computeBoundingBox();
      let offset =
        -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) / 2;
      mesh.position.set(offset, 0, height);
      group.add(mesh);
    });
  }
  animate() {
    this.rippleCircleOpacityChange();
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  stop() {
    if (this.start) {
      cancelAnimationFrame(this.start);
    }
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
}

export default ColumnCircleMark;
