import * as THREE from "three";
import * as turf from "@turf/turf";
import Delaunator from "delaunator";

class DistrictTerrain {
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
    const data = params.data;

    const geometry = this.createGeometry(data);
    this.reMapUv(geometry);
    const point = this.createWallPoint(data, depth);
    const wallGeometry = this.createBottemGeometry(point);
    this.reMapUv(wallGeometry);
    
    // const material = new THREE.MeshLambertMaterial({
    //     color: 'purple',
    //     wireframe: true
    // })
    // const material = new THREE.MeshLambertMaterial({
    //     side: THREE.DoubleSide,
    //     map: diffuseTexture
    // })
    const material = this.createMaterial(
      heightRatio,
      heightTexture,
      diffuseTexture
    );
    const wallMaterial = this.createWallMaterial(
      heightRatio,
      heightTexture,
      diffuseTexture
    )
    const wall = new THREE.Mesh(wallGeometry, wallMaterial)


    const mesh = new THREE.Mesh(geometry, material);
    // this.mesh = mesh;
    // window.mesh = mesh;
    // const bottom = this.createBottom(width, height, heightTexture, color);
    // bottom.position.set(0, 0, -depth);
    const group = new THREE.Group();
    group.add(mesh, wall);
    this.mesh = group;
    
  }
  get mesh() {
    return this.mesh;
  }
  createGeometry(data) {
    const points3d = this.createGridPoint(data);
    const indexDelaunay = Delaunator.from(
      points3d.map(v => {
        return [v.x, v.y];
      })
    );
    const meshIndex = [];
    for (let i = 0; i < indexDelaunay.triangles.length; i++) {
      meshIndex.push(indexDelaunay.triangles[i]);
    }

    let filterdMeshIndex = [];
    for (let i = 0; i < meshIndex.length; i += 3) {
      filterdMeshIndex.push([meshIndex[i], meshIndex[i + 1], meshIndex[i + 2]]);
    }
    filterdMeshIndex = filterdMeshIndex.filter(item => {
      const minItem = Math.min(...item);
      let flag = true;
      if (
        ((item[0] > item[1] && item[1] > item[2]) ||
          (item[1] > item[2] && item[2] > item[0]) ||
          (item[2] > item[0] && item[0] > item[1])) &&
        minItem > this.gridPointLength
      ) {
        flag = false;
      }
      return flag;
    });
    filterdMeshIndex.forEach(points => {
      //原来的顺序生成的三角面片法向量朝向屏幕里的，逆过来改成朝向屏幕外
      let tmp = points[1];
      points[1] = points[2];
      points[2] = tmp;
    });
    filterdMeshIndex = filterdMeshIndex.flat(1);
    const geometry = new THREE.BufferGeometry().setFromPoints(points3d);
    geometry.setIndex(filterdMeshIndex);
    geometry.computeVertexNormals();
    return geometry;
  }
  createWallMaterial(heightRatio, heightTexture, diffiseTexture) {
    var phongShader = THREE.ShaderLib.phong;
    console.log(phongShader)
    const vertexShader = `
            uniform sampler2D heightMap;
            uniform float heightRatio;

            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                float hValue = texture2D(heightMap, vUv).r;
                if(pos.z != 1.0){
                  pos.z = hValue * heightRatio;
                }else{
                  pos.z = -5.0;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `;
    const fragmentShader = `
            uniform sampler2D diffuseMap;
            // uniform sampler2D heightMap;

            varying vec2 vUv;
            varying float aa;
            void main() {
                gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0 );
                // gl_FragColor = vec4(texture2D(heightMap, vUv).rgb, 1.0 );
                // gl_FragColor = vec4(vUv.y, 0.0, 0.0, 1.0 );
                // gl_FragColor = vec4(1.0,1.0,1.0, 1.0 );
            }
        `;
    const terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        heightRatio: { value: heightRatio },
        heightMap: { value: heightTexture },
        diffuseMap: { value: diffiseTexture }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      // wireframe: true,
    });
    return terrainMaterial;
  }
  createBottemGeometry(point){
    const geometry = new THREE.BufferGeometry();
  // 4. 设置position
    const vertices = new Float32Array(point);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return geometry;

  }
  createWallPoint(data, depth) {
    let verticesByTwo = [];
    switch (data.geometry.type) {
      case "Polygon":
        this.traversePolygon(data.geometry.coordinates, p => {
          verticesByTwo.push([[p[0], p[1], 0], [p[0], p[1], depth]]);
        });
        break;
      case "MultiPolygon":
        this.traverseMultiPolygon(data.geometry.coordinates, p => {
          verticesByTwo.push([[p[0], p[1], 0], [p[0], p[1], depth]]);
        });
        break;
    }
    const verticesByFour = verticesByTwo.reduce((arr, item, i) => {
      if (i === verticesByTwo.length - 1) return arr;
      return arr.concat([[...item, ...verticesByTwo[i + 1]]]);
    }, []);
    const verticesByThree = verticesByFour.reduce((arr, item) => {
      const [point1, point2, point3, point4] = item;
      return arr.concat(
        ...point2,
        ...point1,
        ...point4,
        ...point1,
        ...point3,
        ...point4
      );
    }, []);
    return verticesByThree;
    console.log(verticesByThree)

  }
  createGridPoint(data) {
    const districtData = data;
    const extent = turf.bbox(districtData);
    const minX = Math.trunc(extent[0]);
    const maxX = Math.trunc(extent[2]);
    const minY = Math.trunc(extent[1]);
    const maxY = Math.trunc(extent[3]);
    let gridPoints = [];
    console.log(minX,maxX,minY,maxY)
    // const differenceX = Math.abs(maxX - minX);
    // const differenceY = Math.abs(maxY - minY);
    // const difference = Math.max(differenceX, differenceY);
    // const interval = Math.round(difference / 100);
    for (let i = minX; i < maxX; i = parseFloat((i + 0.5).toFixed(2))) {
      for (let j = minY; j < maxY; j = parseFloat((j + 0.5).toFixed(2))) {
        gridPoints.push([i, j]);
      }
    }
    gridPoints = turf.points(gridPoints);

    const points3d = [];

    const inPoint = turf.pointsWithinPolygon(gridPoints, districtData).features;
    this.gridPointLength = inPoint.length;
    inPoint.forEach(point => {
      const coordinates = point.geometry.coordinates;
      points3d.push(new THREE.Vector3(coordinates[0], coordinates[1], 0));
    });
    switch (data.geometry.type) {
      case "Polygon":
        this.traversePolygon(data.geometry.coordinates, point => {
          points3d.push(new THREE.Vector3(point[0], point[1], 0));
        });
        break;
      case "MultiPolygon":
        this.traverseMultiPolygon(data.geometry.coordinates, point => {
          points3d.push(new THREE.Vector3(point[0], point[1], 0));
        });
        break;
    }
    return points3d;
  }
  traversePolygon(polygons, callback) {
    polygons.forEach(polygon => {
      polygon.forEach(point => {
        callback(point);
      });
    });
  }
  traverseMultiPolygon(multiPolygons, callback) {
    multiPolygons.forEach(multiPolygon => {
      multiPolygon.forEach(polygon => {
        polygon.forEach(point => {
          callback(point);
        });
      });
    });
  }
  createMaterial(heightRatio, heightTexture, diffiseTexture) {
    const vertexShader = `
            uniform sampler2D heightMap;
            uniform float heightRatio;

            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                float hValue = texture2D(heightMap, vUv).r;
                pos.z = hValue * heightRatio;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `;
    const fragmentShader = `
            uniform sampler2D diffuseMap;
            // uniform sampler2D heightMap;

            varying vec2 vUv;
            varying float aa;
            void main() {
                gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, 1.0 );
                // gl_FragColor = vec4(texture2D(heightMap, vUv).rgb, 1.0 );
                // gl_FragColor = vec4(vUv.y, 0.0, 0.0, 1.0 );
                // gl_FragColor = vec4(1.0,1.0,1.0, 1.0 );
            }
        `;
    const terrainMaterial = new THREE.ShaderMaterial({
      uniforms: {
        heightRatio: { value: heightRatio },
        heightMap: { value: heightTexture },
        diffuseMap: { value: diffiseTexture }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      // wireframe: true,
    });
    return terrainMaterial;
  }
  reMapUv(geometry) {
    geometry.computeBoundingBox();
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min;
    const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
    const positionArray = geometry.getAttribute("position").array;
    let uvArray = [];

    for (let i = 0; i < positionArray.length; i += 3) {
      uvArray.push((positionArray[i] + offset.y) / range.y);
      uvArray.push((positionArray[i + 1] + offset.x) / range.x);
    }
    uvArray = new THREE.Float32BufferAttribute(uvArray, 2);
    geometry.setAttribute("uv", uvArray);
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
export default DistrictTerrain;
