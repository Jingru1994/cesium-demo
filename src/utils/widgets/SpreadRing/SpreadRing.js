import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

class SpreadRing {
  /**
   * GradientRing构造函数
   *
   * @param {Object} params 参数
   * @param {Number} params.radius0 圆环最大半径
   * @param {Number} params.radius 圆环初始半径
   * @param {Number} params.thetaSegments 圆环分段数，值越大圆环越圆
   * @param {Color} params.color 圆环颜色
   * @param {Number} params.width 圆环宽度，相对圆环半径比例
   */
  constructor(params) {
    if (!params) {
      throw Error("Creating SpreadRing instance must provide parameters");
    }
    const radius0 = params.radius0;
    const thetaSegments = params.thetaSegments;
    const geometry = new THREE.CircleGeometry(radius0, thetaSegments);
    const material = this.createMaterial(params);
    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    const tween1 = new TWEEN.Tween(material.uniforms.radius);
    tween1
      .to({ value: radius0 }, 3000)
      .easing(TWEEN.Easing.Cubic.Out)
      .repeat(Infinity)
      .start();
  }
  createMaterial(params) {
    const radius0 = params.radius0;
    const radius = params.radius;
    const color = params.color || new THREE.Color(0x3ed5eb);
    const width = params.width || 0.15;
    const uniforms3 = {
      radius0: {
        value: radius0
      },
      radius: {
        value: radius
      },
      color: {
        value: color
      },
      width: {
        value: width
      }
    };
    const vertexShader3 = `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    const fragmentShader3 = `
            uniform float radius0;
            uniform float radius;
            uniform vec3 color;
            uniform float width;

            varying vec3 vPosition;
            void main() {
                vec2 center = vec2(0.0, 0.0);
                float d = distance(center, vPosition.xy);
                float pct = d/radius0;
                float width = radius * width;
                float alpha = 0.0;
                
                if(d < radius && d > radius - width) {
                    alpha = -1.0/radius0*radius + 1.0;
                }
                gl_FragColor = vec4(color,alpha);
            }
        `;
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms3,
      vertexShader: vertexShader3,
      fragmentShader: fragmentShader3,
      transparent: true
    });

    return material;
  }
  animate() {
    this.start = requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }
  stop() {
    cancelAnimationFrame(this.start);
  }
  destory() {
    this.stop();
    this.mesh.traverse(item => {
      if (item.isMesh || item instanceof THREE.Sprite) {
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
  }
}
export default SpreadRing;
