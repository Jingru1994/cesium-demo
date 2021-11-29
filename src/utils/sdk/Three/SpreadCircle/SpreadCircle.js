import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

/**
 * 扩散圆
 *
 * @author Dongjingru
 * @alias SpreadCircle
 * @constructor
 * @param {Object} options 参数
 */
class SpreadCircle {
  mesh;
  /**
   * SpreadCircle构造函数
   *
   * @param {Object} options 扩散圆样式
   * @param {Vector3} options.position 扩散圆位置
   * @param {Number} options.radius 扩散圆半径
   * @param {Color} options.color 圆环颜色
   * @param {Number} options.initRadius 扩散圆初始半径
   * @param {Number} options.width 圆环半径
   * @param {Number} options.duration 单个动画持续时间
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating SpreadCircle instance must provide options");
    }
    const radius = options.radius || 20;
    const material = this.createMaterial(radius, options);

    const geometry = new THREE.CircleGeometry(radius, 120);

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    let position = options.position || [0, 0, 0];
    position = position.length === 3 ? position : [...position, 0];
    mesh.position.fromArray(position);

    const duration = options.duration || 3000;
    const tween = new TWEEN.Tween(material.uniforms.radius);
    tween
      .to({ value: radius }, duration)
      .easing(TWEEN.Easing.Cubic.Out)
      .repeat(Infinity)
      .start();
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(radius, options) {
    const color = options.color || "rgb(255, 255, 255)";
    const annulus_radius = options.initRadius || radius / 20;
    const width = options.width || radius / 5;

    const uniforms = {
      color: {
        value: new THREE.Color(color)
      },
      radius: {
        value: annulus_radius
      },
      initRadius: {
        value: annulus_radius
      },
      width: {
        value: width
      }
    };
    const vertexShader = `
            varying vec3 vPosition;
            void main(){
                vPosition = position;
                gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    let fragmentShader = `
            varying vec3 vPosition;
            uniform vec3 color;
            uniform float radius;
            uniform float initRadius;
            uniform float width;

            void main(){
                float pct = distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
                if(pct>radius){
                    gl_FragColor = vec4(1.0,0.0,0.0,0);
                }else{
                    float dis = (pct-(radius-width))/(radius);
                    gl_FragColor = vec4(color,dis*0.8);
                }
            
            }
        `;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
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
  destroy() {
    this.stop();
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
  addTo(scene) {
    scene.add(this.mesh);
  }
}

export default SpreadCircle;
