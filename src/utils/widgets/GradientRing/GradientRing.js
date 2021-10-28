import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
class GradientRing {
  /**
   * GradientRing构造函数
   *
   * @param {Object} params 参数
   * @param {Number} params.innerRadius 圆环内半径
   * @param {Number} params.outerRadius 圆环外半径
   * @param {Number} params.thetaSegments 圆环分段数，值越大圆环越圆
   * @param {Color} params.color 圆环颜色
   * @param {Number} params.thetaLength 圆心角度
   * @param {Boolean} params.openEnd 末尾处是否有明显封闭线，默认为true
   * @param {Number} params.opacity 整体透明度
   * @param {Number} params.direction 旋转方向，默认为true顺时针方向
   * @param {Number} params.duration 旋转一周时间
   */
  constructor(params) {
    if (!params) {
      throw Error("Creating GradientRing instance must provide parameters");
    }
    const innerRadius = params.innerRadius;
    const outerRadius = params.outerRadius;
    const thetaSegments = params.thetaSegments || 32;
    const duration = params.duration || 3000;

    const geometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      thetaSegments
    );
    const material = this.createMaterial(params);

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    const tween = new TWEEN.Tween(material.uniforms.theta0);
    tween
      .to({ value: 360 }, duration)
      .repeat(Infinity)
      .start();
  }
  createMaterial(params) {
    const color = params.color || new THREE.Color(0x3ed5eb);
    const thetaLength = params.thetaLength || 280.0;
    const openEnd =
      typeof params.direction !== "undefined" ? params.direction : true;
    const opacity = params.opacity || 1.0;
    const direction =
      typeof params.direction !== "undefined" ? params.direction : true;

    const uniforms = {
      color: {
        value: color
      },
      direction: {
        value: direction
      },
      thetaLength: {
        value: thetaLength
      },
      theta0: {
        value: 0.0
      },
      openEnd: {
        value: openEnd
      },
      opacity: {
        value: opacity
      }
    };
    const vertexShader = `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    const fragmentShader = `
            #define M_PI 3.1415926535897932384626433832795

            uniform vec3 color;
            uniform float thetaLength;
            uniform float theta0;
            uniform bool direction;
            uniform bool openEnd;
            uniform float opacity;

            varying vec3 vPosition;

            float movingSector(vec2 position, vec2 center) {
                float r = distance(position, center);
                vec2 d = normalize(position - center);
                float radianLength = thetaLength;
                float theta;
                if(!openEnd) {
                    radianLength = clamp(thetaLength + 60.0, 0.0, 360.0);
                }
                if(direction) {
                    theta = mod(atan(d.y, d.x)*180.0/M_PI + theta0, 360.0);
                    
                }else {
                    theta = mod(theta0 - atan(d.y, d.x)*180.0/M_PI, 360.0);
                }
                float gradient = clamp(1.0 - theta/radianLength, 0.0, 1.0);
                if(!openEnd) {
                    if(theta > thetaLength) {
                        gradient = 0.0;
                    }
                }
                return opacity*gradient;
            }
            void main() {
                float alpha;
                vec2 center = vec2(0.0, 0.0);
                alpha = movingSector(vPosition.xy, center);
                gl_FragColor = vec4(color,alpha);
            }
        `;
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
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

export default GradientRing;
