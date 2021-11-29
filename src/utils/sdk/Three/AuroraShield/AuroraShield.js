import * as THREE from "three";

/**
 * 流光光罩
 *
 * @author Dongjingru
 * @alias PatternShield
 * @constructor
 * @param {Object} options 参数
 */
class AuroraShield {
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
    const material = this.createMaterial(options);
    this.material = material;

    const radius = options.radius || 5;
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
    this.mesh = mesh;
    mesh.rotation.x = Math.PI / 2;

    let position = options.position || [0, 0, 0];
    position = position.length === 3 ? position : [...position, 0];
    mesh.position.fromArray(position);

    this.animate(material);
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(options) {
    const color = options.color || "rgb(85,187,237)";
    const uniforms = {
      time: {
        value: 0.0 // 噪声随时间变化
      },
      glowColor: {
        type: "v3",
        value: new THREE.Color(color)
      }
    };
    let vertex = `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main()
            {
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    let fragment = `
            #ifdef GL_ES
            precision mediump float;
            #endif

            uniform float b;
            uniform float p;
            uniform float s;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;

            uniform float time;
            uniform float offset;
            uniform vec3 glowColor;
            uniform sampler2D backgroundTexture;

            varying vec2 vUv;

            mat2 rotate(in float a)
            {
                float c = cos(a), s = sin(a);
                return mat2(c,s,-s,c);
            }

            float lightningNoise (vec2 forPos)
            {
                forPos *= 4.0;
                forPos.y *= 0.85;
                float wobbleAmount1 = sin(forPos.y) * 0.5 + sin(forPos.y * 2.0) * 0.25 + sin(forPos.y * 4.0) * 0.125 + sin(forPos.y * 8.0) * 0.0625;
                float wobbleAmount2 = sin(forPos.x) * 0.5 + sin(forPos.x * 2.0) * 0.25 + sin(forPos.x * 4.0) * 0.125 + sin(forPos.x * 8.0) * 0.0625;
                float horizontalStrike = 1.0 - abs(sin(forPos.x + wobbleAmount1 * 1.1));
                float verticalStrike = 1.0 - abs(cos(forPos.y + wobbleAmount2 * 1.1));
                return (horizontalStrike + verticalStrike) * 0.35;
            }

            float fBm (in vec2 uv)
            {
                float amp = 0.5;
                float res = 0.0;
                for (int i = 0; i < 5; ++i) {
                    res += amp * lightningNoise(uv);
                    // res += amp;
                    uv *= 2.0;
                    amp *= 0.5;
                }
                return res;
            }

            float domainWarp (in vec2 uv)
            {
                mat2 rotMat = rotate(0.3);
                float v1 = fBm(rotMat * uv + 0.05 * time);
                uv = rotMat * uv + 1.0;
                float v2 = fBm(uv - 0.01 * time);
                uv = rotMat * uv + 1.0;
                float v3 = fBm(uv + 0.03 * time);
                uv = rotMat * uv + 1.0;
                float v4 = fBm(uv - 0.04 * time);
                float finalRes = fBm (vec2 (fBm(vec2 (v1,v2)), fBm(vec2 (v3,v4))));
                return clamp (pow (1.0 - finalRes, 10.0) * lightningNoise (rotate (0.1 * time) * uv) * 10.0, 0.0, 0.9);
            }

            void main() {
                vec4 col = vec4(0);
                vec4 avgCol = vec4(0);
                for(float i=0.;i<20.;i++){
                  float rzt = domainWarp(vUv);
                  vec4 col2 = vec4(0,0,0, rzt);
                  col2.rgb = (sin(1.-vec3(0.0,0.0, 0.0)+i*0.043)*0.5+0.5)*rzt;
                  avgCol =  mix(avgCol, col2, .5);
                  col += avgCol*exp2(-i*0.03 - 2.5)*smoothstep(0.,5., i);
                }
                col = col * vec4(glowColor,1.0);
                gl_FragColor = vec4(col.rgb,clamp(col.a,0.2,0.8));
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
  animate() {
    this.material.uniforms.time.value += 0.01;
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  stop() {
    if (this.start) {
      cancelAnimationFrame(this.start);
    }
  }
}

export default AuroraShield;
