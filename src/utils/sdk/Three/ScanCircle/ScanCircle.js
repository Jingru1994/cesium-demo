import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

/**
 * 扫描圆
 *
 * @author Dongjingru
 * @alias ScanCircle
 * @constructor
 * @param {Object} options 参数
 */
class ScanCircle {
  mesh;
  /**
   * ScanCircle构造函数
   *
   * @param {Object} options 选项
   * @param {Vector3} options.position 扫描圆位置
   * @param {Number} options.radius 扫描圆半径
   * @param {Number} options.angle 扫描圆角度范围
   * @param {Color} options.color 扫描圆颜色
   * @param {Number} options.duration 单个动画持续时间
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating ScanCircle instance must provide options");
    }
    const radius = options.radius || 20;
    const material = this.createMaterial(radius, options);
    this.material = material;

    const geometry = new THREE.CircleGeometry(radius, 120);

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh = mesh;

    let position = options.position || [0, 0, 0];
    position = position.length === 3 ? position : [...position, 0];
    mesh.position.fromArray(position);

    const duration = options.duration || 3000;
    const tween = new TWEEN.Tween(material.uniforms.theta);
    tween
      .to({ value: 360.0 }, duration)
      .repeat(Infinity)
      .start();
    this.animate();
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(radius, options) {
    const color = options.color || "rgb(255, 255, 255)";
    const angle = options.angle || 90;

    const uniforms = {
      color: {
        value: new THREE.Color(color)
      },
      radius: {
        value: radius
      },
      theta: {
        value: 0.0
      },
      angle: {
        value: angle
      }
    };
    const vertexShader = `
            varying vec3 vPosition;
            void main(){
                vPosition=position;
                gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    const fragmentShader = `
            #define M_PI 3.1415926535897932384626433832795

            varying vec3 vPosition;
            uniform vec3 color;
            uniform float radius;
            uniform float theta;
            uniform float angle;

            float movingLine(vec2 position, vec2 center, float radius)
            {
                //angle of the line
                float theta0 = theta;
                vec2 d = position - center;
                float r = sqrt( dot( d, d ) );
                if(r<radius)
                {
                    //compute the distance to the line theta=theta0
                    // vec2 p = radius*vec2(cos(theta0*M_PI/180.0), sin(theta0*M_PI/180.0));
                    // float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
                    d = normalize(d);
                    //compute gradient based on angle difference to theta0
                    float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
                    float gradient = clamp(1.0-theta/angle,0.0,1.0);
                    return 0.5*gradient;
                }
                else return 0.0;
            }
            void main()
            {
                float opacity;
                vec2 center = vec2(0.0, 0.0);
                opacity = movingLine(vPosition.xy, center, radius);
                gl_FragColor = vec4( color, opacity );
                
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

export default ScanCircle;
