import * as THREE from "three";
// import * as d3 from 'd3'
const d3 = Object.assign(
  {},
  require("d3-selection"),
  require("d3-geo"),
  require("d3-path")
);

class InnerGlowMaterial {
  material;
  /**
   * InnerGlowMaterial构造函数
   *
   * @param {JSON} feature Geojson中的一个feature
   * @param {Object} options 内发光演示参数
   * @param {Color} options.glowColor 发光色
   * @param {Number} options.glowColorSize 发光宽度，取值范围[0,1]
   */
  constructor(feature, options) {
    let size = this.computeCanvasSize(feature);
    let texture = this.createTexture(size);
    let material = this.createMaterial(texture, options);
    this.material = material;
  }
  get material() {
    return this.material;
  }
  createMaterial(texture1, options) {
    let glowColor =
      (options && options.glowColor) || new THREE.Color("rgb(255,0,0)");
    let glowColorSize = (options && options.glowColorSize) || 0.15;
    let texture = texture1;
    let uniforms = {
      glowColor: {
        value: glowColor
      },
      glowColorSize: {
        value: glowColorSize
      },
      texture1: {
        value: texture
      }
    };
    let vertexShader = `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    let fragmentShader = `
            varying vec2 vUv;
            uniform vec3 glowColor;
            uniform float glowColorSize;
            uniform sampler2D texture1;

            /**
            * 获取指定角度方向，距离为xxx的像素的透明度
            *
            * @param angle 角度 [0.0, 360.0]
            * @param dist 距离 [0.0, 1.0]
            *
            * @return alpha [0.0, 1.0]
            */
            float getColorAlpha(float angle, float dist) {
                // 角度转弧度，公式为：弧度 = 角度 * (pi / 180)
                float radian = radians(angle);
                vec4 color = texture2D(texture1, vUv + vec2(dist * cos(radian), dist * sin(radian)));
                return color.a;
            }
            // /**
            // * 获取指定距离的周边像素的透明度平均值
            // *
            // * @param dist 距离 [0.0, 1.0]
            // *
            // * @return average alpha [0.0, 1.0]
            // */
            float getAverageAlpha(float dist) {
                float totalAlpha = 0.0;
                // 以30度为一个单位，那么「周边一圈」就由0到360度中共计12个点的组成
                totalAlpha += getColorAlpha(0.0, dist);
                totalAlpha += getColorAlpha(30.0, dist);
                totalAlpha += getColorAlpha(60.0, dist);
                totalAlpha += getColorAlpha(90.0, dist);
                totalAlpha += getColorAlpha(120.0, dist);
                totalAlpha += getColorAlpha(150.0, dist);
                totalAlpha += getColorAlpha(180.0, dist);
                totalAlpha += getColorAlpha(210.0, dist);
                totalAlpha += getColorAlpha(240.0, dist);
                totalAlpha += getColorAlpha(270.0, dist);
                totalAlpha += getColorAlpha(300.0, dist);
                totalAlpha += getColorAlpha(330.0, dist);
                return totalAlpha * 0.0833; // 1 / 12 = 0.08333
            }
            // /**
            // * 获取发光的透明度
            // */
            float getGlowAlpha() {
                // 如果发光宽度为0，直接返回0.0透明度，减少计算量
                if (glowColorSize == 0.0) {
                    return 0.0;
                }

                // 将传入的指定距离，平均分成10圈，求出每一圈的平均透明度，
                // 然后求和取平均值，那么就可以得到该点的平均透明度
                float totalAlpha = 0.0;
                totalAlpha += getAverageAlpha(glowColorSize * 0.1);
                totalAlpha += getAverageAlpha(glowColorSize * 0.2);
                totalAlpha += getAverageAlpha(glowColorSize * 0.3);
                totalAlpha += getAverageAlpha(glowColorSize * 0.4);
                totalAlpha += getAverageAlpha(glowColorSize * 0.5);
                totalAlpha += getAverageAlpha(glowColorSize * 0.6);
                totalAlpha += getAverageAlpha(glowColorSize * 0.7);
                totalAlpha += getAverageAlpha(glowColorSize * 0.8);
                totalAlpha += getAverageAlpha(glowColorSize * 0.9);
                totalAlpha += getAverageAlpha(glowColorSize * 1.0);
                return totalAlpha * 0.1;
            }


            void main(){
                float alpha = getGlowAlpha();

                alpha = 1.0 - alpha;
                // alpha = -1.0 * (alpha - 1.0) * (alpha - 1.0) * (alpha - 1.0) * (alpha - 1.0) + 1.0;
  
                gl_FragColor = vec4(glowColor, alpha);
            }
        `;
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    return material;
  }
  createTexture(size) {
    let width = size.width;
    let height = size.height;
    let feature = size.feature;
    let path = d3.geoPath().projection(null);
    let canvas = d3
      .select("body")
      .append("canvas")
      .attr("width", width)
      .attr("height", height)
      .attr("style", "display: none");
    // canvas.style.display = "none"
    let context = canvas.node().getContext("2d");
    context.translate(width / 2, height / 2);
    let canvasPath = path.context(context);
    context.fillStyle = "rgba(255,0,0)";
    context.beginPath();
    canvasPath(feature);
    context.fill();
    let canvas1 = canvas._groups[0][0];
    console.log(canvas1);
    let texture = new THREE.Texture(canvas1);
    texture.needsUpdate = true;

    return texture;
  }
  computeCanvasSize(feature1) {
    let feature = JSON.stringify(feature1);
    feature = JSON.parse(feature);
    let center = this.computeFeatureCenter(feature);

    let length = feature.geometry.coordinates.length;
    let points_prj = [];
    let projection = d3
      .geoMercator()
      .center(center)
      .translate([0, 0]);
    for (let i = 0; i < length; i++) {
      let points = feature.geometry.coordinates[i][0];
      points_prj = [];
      points.forEach(point => {
        let postPoint = projection(point);
        points_prj.push([postPoint[0] * 50, postPoint[1] * 50]);
      });
      feature.geometry.coordinates[i][0] = points_prj;
    }
    let xMax = Math.max(
      ...points_prj.map(item => {
        return item[0];
      })
    );
    let xMin = Math.min(
      ...points_prj.map(item => {
        return item[0];
      })
    );
    let yMax = Math.max(
      ...points_prj.map(item => {
        return item[1];
      })
    );
    let yMin = Math.min(
      ...points_prj.map(item => {
        return item[1];
      })
    );
    let width = (xMax - xMin).toFixed(2);
    let height = (yMax - yMin).toFixed(2);
    return {
      width: width,
      height: height,
      feature: feature
    };
  }
  computeFeatureCenter(feature) {
    let coordinateList = [];
    feature.geometry.coordinates.forEach(coordinate => {
      coordinate.forEach(points => {
        coordinateList.push(...points);
      });
    });

    let xMax = Math.max(
      ...coordinateList.map(item => {
        return item[0];
      })
    );
    let xMin = Math.min(
      ...coordinateList.map(item => {
        return item[0];
      })
    );
    let yMax = Math.max(
      ...coordinateList.map(item => {
        return item[1];
      })
    );
    let yMin = Math.min(
      ...coordinateList.map(item => {
        return item[1];
      })
    );
    //计算最值的另一种方法
    // let xMax1 = coordinateList.sort((a,b) => { return b[0]-a[0]})[0][0]
    // let xMin1 = coordinateList.sort((a,b) => { return a[0]-b[0]})[0][0]
    let center = [(xMax + xMin) / 2, (yMax + yMin) / 2];
    return center;
  }
}

export default InnerGlowMaterial;
