import * as THREE from "three";

class BottomCircle {
  mesh;
  material;
  start;
  /**
   * ColumnCircleMark构造函数
   *
   * @param {Object} options 底部元素样式
   * @param {Number} options.radius 半径
   * @param {Vector3} options.position 位置
   */
  constructor(options) {
    let mesh = new THREE.Group();
    console.log(mesh);
    this.interval = 0.02;

    let radius = (options && options.radius) || 44;
    let position =
      (options && options.position) || new THREE.Vector3(0, 0, -0.01);

    let dashCircleOptions = {
      color: new THREE.Color("rgb(86, 191, 164)"),
      radius: radius //44
    };
    let dashCircle = this.createDashCircle(dashCircleOptions);

    let triangleOptions = {
      color: new THREE.Color("rgb(255,146,86)"),
      radius: radius * 0.955, //42
      size: 1,
      start: 0
    };
    let triangle1 = this.createTriangle(triangleOptions);
    this.triangle1 = triangle1;
    let o = Object.assign(triangleOptions, {
      color: new THREE.Color("rgb(68,215,166)"),
      start: 0.5
    });
    console.log(o);
    let triangle2 = this.createTriangle(o);
    this.triangle2 = triangle2;

    let ringOptions = {
      color: new THREE.Color("rgb(86, 191, 164)"),
      radius: radius * 0.932 // 0.93*44
    };
    let ring = this.createRing(ringOptions);

    let splitRingOptions = {
      radius: radius * 0.864 //38
    };
    let splitRing = this.createSplitRing(splitRingOptions);

    let arcOptions = {
      color: new THREE.Color("rgb(249, 232, 98)"),
      radius: radius * 0.936 //41.2
    };
    let arc = this.createArc(arcOptions);
    this.arc = arc;
    mesh.add(dashCircle, triangle1, triangle2, ring, splitRing, arc);

    mesh.position.copy(position);
    this.mesh = mesh;
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createDashCircle(options) {
    let color = options.color;
    let radius = options.radius;

    const vertices = [];
    const divisions = 50;

    for (let i = 0; i <= divisions; i++) {
      const v = (i / divisions) * (Math.PI * 2);

      const x = Math.sin(v) * radius;
      const y = Math.cos(v) * radius;

      vertices.push(x, y, 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    let material = new THREE.LineDashedMaterial({
      color: color,
      dashSize: 1,
      gapSize: 1
    });
    let mesh = new THREE.Line(geometry, material);
    mesh.computeLineDistances();
    return mesh;
  }
  createTriangle(options) {
    let color = options.color;
    let radius = options.radius;
    let size = options.size;
    let start = options.start;

    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(-size, 0);
    triangleShape.lineTo(size, size);
    triangleShape.lineTo(size, -size);
    triangleShape.lineTo(-size, 0);
    let triangleGeometry = new THREE.ShapeGeometry(triangleShape);

    let material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    let mesh = new THREE.Mesh(triangleGeometry, material);
    mesh.position.set(0, -radius, 0);
    mesh.time = start;
    return mesh;
  }

  createRing() {
    const geometry = new THREE.RingGeometry(41, 40.6, 120);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(86, 191, 164)"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  createSplitRing() {
    const group = new THREE.Group();
    let w = (2 * Math.PI * 3) / 10;
    let int = (2 * Math.PI) / 30;
    const geometry1 = new THREE.RingGeometry(38, 31, 120, 8, 0, w);
    const material1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(255, 255, 254)"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const geometry2 = new THREE.RingGeometry(38, 31, 120, 8, w + int, w);
    const material2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(255, 255, 254)"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const geometry3 = new THREE.RingGeometry(38, 31, 120, 8, 2 * (w + int), w);
    const material3 = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(255, 255, 254)"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });

    let mesh1 = new THREE.Mesh(geometry1, material1);
    let mesh2 = new THREE.Mesh(geometry2, material2);
    let mesh3 = new THREE.Mesh(geometry3, material3);
    group.add(mesh1, mesh2, mesh3);
    return group;
  }
  createArc() {
    const geometry = new THREE.RingGeometry(
      41.2,
      40.4,
      84,
      8,
      0,
      (2 * Math.PI) / 35
    );
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(249, 232, 98)"),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0.01);
    this.arc = mesh;
    return mesh;
  }
  animateSubElements() {
    this.interval += 0.02;
    this.triangle1.time +=
      (2 * Math.sin(this.interval) +
        Math.cos(0.5 * this.interval + 0.2) +
        Math.sin(0.8 * this.interval) +
        0.7) *
      0.01;
    this.triangle2.time +=
      (2 * Math.sin(this.interval + 2) +
        Math.cos(0.5 * this.interval + 0.2 + 2) +
        Math.sin(0.8 * this.interval + 2) +
        0.7) *
      0.01;
    // console.log(this.interval.value)
    this.triangle1.position.x = Math.cos(this.triangle1.time) * 42;
    this.triangle1.position.y = Math.sin(this.triangle1.time) * 42;
    this.triangle1.rotation.z = this.triangle1.time;
    this.triangle2.position.x = Math.cos(this.triangle2.time) * 42;
    this.triangle2.position.y = Math.sin(this.triangle2.time) * 42;
    this.triangle2.rotation.z = this.triangle2.time;
    this.arc.rotation.z +=
      (2 * Math.sin(this.interval + 3.5) +
        Math.cos(0.5 * this.interval + 0.2 + 3.5) +
        0.7) *
      0.01;
  }
  animate() {
    this.animateSubElements();
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

export default BottomCircle;
