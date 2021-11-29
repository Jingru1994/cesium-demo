import * as THREE from "three";

/**
 * 发光光罩
 *
 * @author Dongjingru
 * @alias GlowShield
 * @constructor
 * @param {Object} options 参数
 */
class GlowShield {
  mesh;
  /**
   * GradieCircle构造函数
   *
   * @param {Object} options 半球样式
   * @param {Vector3} options.position 半球位置
   * @param {Number} options.radius 半球半径
   * @param {Color} options.color 半球颜色
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating PatternShield instance must provide options");
    }
    const radius = options.radius || 5;
    const material = this.createMaterial(options);
    this.material = material;
    const geometry = new THREE.SphereGeometry(
      radius,
      32,
      32,
      0,
      2 * Math.PI,
      0,
      Math.PI / 2
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    this.mesh = mesh;

    let position = options.position || [0, 0, 0];
    position = position.length === 3 ? position : [...position, 0];
    mesh.position.fromArray(position);
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(options) {
    const color = options.color || "rgb(85,187,237)";
    const uniforms = {
      s: { type: "f", value: -1.0 },
      b: { type: "f", value: 1.0 }, //决定了颜色最亮值的位置
      p: { type: "f", value: 2.0 }, //定了透明度变化速度及方向
      glowColor: {
        type: "v3",
        value: new THREE.Color(color)
      }
    };
    const vertex = `
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main()
            {
                //normal法向量  normalMatrix inverse transpose of modelViewMatrix normalize归一化,将物体坐标系下的法向量转为视图坐标系下法向量方向
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    const fragment = `
            uniform vec3 glowColor;
            uniform float b;
            uniform float p;
            uniform float s;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;

            void main() {
                float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
                a = clamp(a, 0.2, 0.9);
                gl_FragColor = vec4( glowColor, a );

            }
        `;
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide,
      depthWrite: false,
      transparent: true
    });
    return material;
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
  destroy() {
    this.mesh.traverse(item => {
      if (item.isMesh) {
        item.geometry.dispose();
        if (item.material instanceof Array) {
          item.material.forEach(material => {
            material.dispose();
            material = null;
          });
        } else {
          item.material.dispose();
          item.material = null;
        }
      }
    });
    this.mesh = null;
  }
}

export default GlowShield;
