import * as THREE from "three";

class DistricTerrain {
  /**
   * ColumnCircleMark构造函数
   *
   * @param {Object} params 参数设置
   * @param {Number} params.width 要素宽度
   * @param {Number} params.height 要素长度
   * @param {Number} params.depth 要素厚度
   * @param {Texture} params.heightRatio 地形拉伸系数
   * @param {Texture} params.heightTexture 地形高度纹理(DEM)
   * @param {Texture} params.diffuseTexture 地形表面纹理，可以为影像
   * @param {Color} params.color 底面颜色
   */
  mesh;
  constructor(params) {
    if (!params) {
      throw Error("Creating ParticleSystem instance must provide parameters");
    }
    const width = params.width || 100;
    const height = params.height || 100;
    const depth = params.depth || 3.0;
    const heightRatio = params.heightRatio || 3.0;
    const heightTexture = params.heightTexture;
    const diffuseTexture = params.diffuseTexture;
    const color = params.color || new THREE.Color(0x244931);

    const terrain = this.createTerrain(
      width,
      height,
      depth,
      heightRatio,
      heightTexture,
      diffuseTexture
    );
    const bottom = this.createBottom(width, height, heightTexture, color);
    bottom.position.set(0, 0, -depth);
    const group = new THREE.Group();
    group.add(terrain, bottom);
    this.mesh = group;
  }
  get mesh() {
    return this.mesh;
  }
  createTerrain(
    width,
    height,
    depth,
    heightRatio,
    heightTexture,
    diffiseTexture
  ) {
    const vertexShader = `
            uniform sampler2D heightMap;
            uniform float heightRatio;
            uniform float depth;

            varying vec2 vUv;
            varying float hValue;
            varying float isTrue;
            void main() {
                isTrue = 1.0;
                vUv = uv;
                vec3 pos = position;
                hValue = texture2D(heightMap, vUv).r;
                pos.z = hValue * heightRatio;
                if(texture2D(heightMap, vUv).a < 1.0){
                    pos.z = 0.0;
                    isTrue = 0.0;
                }
                if(texture2D(heightMap, vUv).r == 0.0 && texture2D(heightMap, vUv).b == 0.0){
                    pos.z = -depth;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `;
    const fragmentShader = `
            uniform sampler2D heightMap;
            uniform sampler2D diffuseMap;

            varying float hValue;
            varying vec2 vUv;
            varying float isTrue;
            void main() {
                float alpha;
                alpha = 0.0;
                if(isTrue == 1.0){
                    alpha = 1.0;
                }
                gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, alpha );
            }
        `;
    const terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        depth: { value: depth },
        heightRatio: { value: heightRatio },
        heightMap: { value: heightTexture },
        diffuseMap: { value: diffiseTexture }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    const terrainGeometry = new THREE.PlaneGeometry(
      width,
      height,
      width * 5,
      height * 5
    );
    const planeTerrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    return planeTerrain;
  }
  createBottom(width, height, heightTexture, color) {
    const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `;
    const fragmentShader = `
            uniform sampler2D heightMap1;
            uniform vec3 color;
            varying vec2 vUv;
            void main() {
                float alpha = 0.0;
                float isTrue = 1.0;
                if(texture2D(heightMap1, vUv).a < 1.0){
                    isTrue = 0.0;
                }
                if(isTrue == 1.0){
                    alpha = 1.0;
                }
                
                // float alpha = 1.0;
                // if(texture2D(heightMap1, vUv).a < 1.0){
                //     alpha = 0.0;
                // }

                gl_FragColor = vec4(color.rgb, alpha);
            }
        `;

    const bottomGeometry = new THREE.PlaneGeometry(
      width,
      height,
      width * 5,
      height * 5
    );
    const bottomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        heightMap1: { value: heightTexture },
        color: { value: color }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.BackSide
    });
    const bottomPlane = new THREE.Mesh(bottomGeometry, bottomMaterial);
    return bottomPlane;
  }
}
export default DistricTerrain;
