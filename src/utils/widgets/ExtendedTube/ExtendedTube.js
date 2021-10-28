import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";

class ExtendedTube {
  /**
   * GradientRing构造函数
   *
   * @param {Object} params 参数
   * @param {Curve} params.curve 路线
   * @param {Number} params.tubularSegments 管道分段数
   * @param {Number} params.innerRadius 内部管道的半径
   * @param {Number} params.percent 内部管道渐变长度，即占管道整体长度百分比，取值范围为（0，1）
   * @param {Color} params.innerColor 内部管道颜色
   * @param {Color} params.duration 内部管道动画持续时间
   * @param {Number} parmas.pointsNum 获取curve上点数量，每帧外部管道增加一个点
   * @param {Number} params.outerRadius 外部管道的半径
   * @param {Color} params.outerColor 外部管道颜色
   * @param {Nimber} params.speedScale 外部管道延伸速度调节因子，取值必须为整数,正值加速，负值减速，值越大速度变化越大
   */
  constructor(params) {
    if (!params) {
      throw Error("Creating ExtendedTube instance must provide parameters");
    }
    this.textures = [];
    const innerTube = this.createInnerTube(params);
    const outerTube = this.createOuterTube(params);
    const group = new THREE.Group(innerTube, outerTube);
    group.add(innerTube, outerTube);
    this.mesh = group;
    this.animate();
  }
  createOuterTube(params) {
    const curve = params.curve;
    const radius = params.outerRadius || 0.8;
    const color = params.outerColor || new THREE.Color(0xfff200);
    const pointsNum = params.pointsNum || 100;
    const tubularSegments = params.tubularSegments || 50;
    const speedScale = params.speedScale || 1;
    this.outerTube = mesh;
    const points = curve.getPoints(pointsNum);
    const curve1 = new THREE.CatmullRomCurve3([points[0], points[1]]);
    const geometry = new THREE.TubeGeometry(
      curve1,
      tubularSegments,
      radius,
      8,
      false
    );
    const texture = new THREE.TextureLoader().load("images/tourism/tube.png");
    this.textures.push(texture);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: 0x0,
      specular: 0x111111,
      shininess: 30,
      side: THREE.DoubleSide,
      // wireframe: true,
      map: texture
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    this.outerTube = mesh;
    this.tubularSegments = tubularSegments;
    this.outerRadius = radius;
    this.pointsNum = pointsNum + 1;
    this.points = points;
    this.pointList = [];
    // this.speedUp = 0;
    this.speedDown = 0;
    if (speedScale > 0) {
      this.speedDownScale = 1;
      this.speedUpScale = Math.round(speedScale);
    } else if (speedScale < 0) {
      this.speedDownScale = Math.abs(Math.round(speedScale));
      this.speedUpScale = 1;
    } else {
      this.speedDownScale = 1;
      this.speedUpScale = 1;
    }

    return mesh;
  }
  createInnerTube(params) {
    const curve = params.curve;
    const radius = params.innerRadius || 0.5;
    const tubularSegments = params.tubularSegments || 50;
    const percent = params.percenet || 0.1;
    const color = params.innerColor || new THREE.Color(0xffffff);
    const duration = params.innerDuration || 5000;
    const uniforms = {
      t: {
        value: 0
      },
      percent: {
        value: percent
      },
      color: {
        value: color
      }
    };
    const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    const fragmentShader = `
            uniform float t;
            uniform float percent;
            uniform vec3 color;

            varying vec2 vUv;
            void main() {
                float alpha;
                alpha = smoothstep(t- percent, t, vUv.x) * step(-t, -vUv.x);
                // alpha = (vUv.x - (t-percent))/(t - (t - percent)); //以下注释代码与上面代码等效
                // if(vUv.x > t) {
                //     alpha =0.0;
                // }
                gl_FragColor = vec4(color,alpha);
            }
        `;
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthTest: false,
      uniforms: uniforms,
      side: THREE.DoubleSide
    });
    const toValue = 1 + percent;
    const tween = new TWEEN.Tween(material.uniforms.t)
      .to({ value: toValue }, duration)
      .repeat(Infinity);
    this.innerTubeTween = tween;

    const geometry = new THREE.TubeGeometry(
      curve,
      tubularSegments,
      radius,
      8,
      false
    );
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
  extendTube() {
    if (this.pointList.length >= this.pointsNum) {
      return;
    }

    if (this.speedDown % this.speedDownScale === 0) {
      this.pointList.push(...this.points.splice(0, this.speedUpScale));
      // this.pointList.push(...this.points.slice(this.speedUp*this.speedUpScale,this.speedUp*this.speedUpScale+this.speedUpScale));
      if (this.pointList.length > 2) {
        const curve = new THREE.CatmullRomCurve3(this.pointList);
        const geometry = new THREE.TubeGeometry(
          curve,
          this.tubularSegments,
          this.outerRadius,
          8,
          false
        );
        this.outerTube.geometry = geometry;
      }
      // this.speedUp++;
    }
    if (this.pointList.length === this.pointsNum) {
      this.innerTubeTween.start();
    }
    this.speedDown++;
  }
  animate() {
    this.extendTube();
    this.start = requestAnimationFrame(this.animate.bind(this));
  }
  stop() {
    cancelAnimationFrame(this.start);
  }
  destory() {
    this.stop();
    this.mesh.traverse(item => {
      if (item.isMesh || item instanceof item) {
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
    this.textures.forEach(texture => {
      texture.dispose();
    });
  }
}

export default ExtendedTube;
