import * as THREE from "three";
import h337 from "heatmap.js";

class Heatmap {
  mesh;
  material;
  start;
  /**
   * 3DHeatmap构造函数
   *
   * @param {Object} options 3DHeatmap选项
   * @param {Array} options.points 数据列表，每个元素是个对象{x:0,y:0,value:0}
   * @param {Object} options.heatmapOptions heatmap选项
   * @param {Number} options.heightRatio 高度比率
   * @param {Number} options.width 宽度
   * @param {Number} options.height 高度
   *
   */
  constructor(options) {
    const points = options && options.data;
    if (!points) {
      return;
    }
    const heatmapOptions = options && options.heatmapOptions;
    const heightRatio = (options && options.heightRatio) || 5.0;
    const width = (options && options.width) || 10;
    const height = (options && options.height) || 10;

    const material = this.createMaterial(
      points,
      heatmapOptions,
      heightRatio,
      width,
      height
    );
    const geometry = new THREE.PlaneGeometry(
      width,
      height,
      width * 10,
      height * 10
    );
    const mesh = new THREE.Mesh(geometry, material);

    this.mesh = mesh;
  }
  get mesh() {
    return this.mesh;
  }
  createMaterial(points, options, heightRatio, width, height) {
    const max = Math.max(
      ...points.map(item => {
        return item.value;
      })
    );
    const xMax = Math.max(
      ...points.map(item => {
        return item.x;
      })
    );
    const yMax = Math.max(
      ...points.map(item => {
        return item.y;
      })
    );
    console.log(width, height);
    const container = document.createElement("div");
    container.classList.add(".heatmap");
    container.style.height = yMax + "px";
    container.style.width = xMax + "px";
    document.body.appendChild(container);

    const heatmapOptions = Object.assign({ container: container }, options);
    const heatmap = h337.create(heatmapOptions);
    heatmap.setData({
      max: max,
      data: points
    });

    const canvas = container.firstChild;
    const texture = new THREE.CanvasTexture(canvas);

    const vertexShader = `
            uniform sampler2D heightMap;
            uniform float heightRatio;
            varying vec2 vUv;
            varying float hValue;
            void main() {
                vUv = uv;
                vec3 pos = position;
                hValue = texture2D(heightMap, vUv).a;
                pos.z = hValue * heightRatio;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `;
    const fragmentShader = `
            uniform sampler2D heightMap;
            varying float hValue;
            varying vec2 vUv;
            
            // honestly stolen from https://www.shadertoy.com/view/4dsSzr
            vec3 heatmapGradient(float t) {
                return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
            }

            void main() {
                // float v = abs(hValue - 1.);
                // gl_FragColor = vec4(heatmapGradient(hValue), 1. - v * v) ;
                gl_FragColor = texture2D(heightMap, vUv) ;
            }
        `;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        heightMap: { value: texture },
        heightRatio: { value: heightRatio }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    container.remove();

    return material;
  }
  addTo(scene) {
    scene.add(this.mesh);
  }
}

export default Heatmap;
