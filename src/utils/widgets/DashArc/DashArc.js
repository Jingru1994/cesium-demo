import * as THREE from "three";

class SemiRing {
  mesh;
  material;
  start;
  /**
   * SemiRing构造函数
   *
   * @param {Object} options 底部元素样式
   * @param {Color} options.radius 圆半径
   * @param {Color} options.position 位置
   * @param {Color} options.dotRadius 点半径
   * @param {Color} options.dotColor 点颜色
   * @param {Number} options.gap 点间隙
   * @param {Number} options.sAngle 起始角
   * @param {Vector3} options.eAngle 结束角
   * @param {Vector3} options.speed 速度
   */
  constructor(options) {
    const radius = (options && options.radius) || 30;
    const position =
      (options && options.position) || new THREE.Vector3(0, 0, 0);
    const speed = (options && options.speed) || 0.01;
    this.speed = speed;

    const geometry = new THREE.CircleGeometry(radius, 64);
    const material = this.createMaterial(options);

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.copy(position);
    this.mesh = mesh;
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(options) {
    const radius = (options && options.dotRadius) || 2;
    const sAngle = (options && options.sAngle) || 0;
    const eAngle = (options && options.eAngle) || Math.PI;
    const gap = (options && options.gap) || 30;

    const canvas = document.createElement("canvas");
    canvas.width = 1400 + radius * 2;
    canvas.height = 1400 + radius * 2;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = radius * 2;
    ctx.lineCap = "round";
    ctx.setLineDash([0, gap]);
    ctx.arc(700 + radius, 700 + radius, 700, sAngle, eAngle);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });

    return material;
  }
  animate() {
    this.mesh.rotation.z += this.speed;
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

export default SemiRing;
