import * as THREE from "three";
import * as d3 from "d3-geo";
import PickModelController3 from "@/utils/sdk/Three/PickModelController3/PickModelController3.js";
import Popup from "@/utils/sdk/Three/Popup/Popup.js";

/**
 * 拉伸地图
 *
 * @author Dongjingru
 * @alias ExtrudeMap
 * @constructor
 * @param {Object} options 参数
 */
class ExtrudeMap {
  /**
   * 拉伸地图
   *
   * @param {Object} options 选项。
   * @param {Object} options.data 地图数据，geojson的features部分。
   * @param {Array} [options.projectCenter] 投影中心[经度，纬度]，默认为几何中心。
   * @param {Number} [options.depth] 地图斑块拉伸厚度。
   * @param {String} [options.mapColor] 地图斑块颜色。
   * @param {String} [options.specularColor] 地图斑块反射颜色。
   * @param {String} [options.sideColor] 地图斑块拉伸侧边颜色。
   * @param {String} [options.lineColor] 地图边界线颜色。
   * @param {Boolean} [options.pickable] 地图斑块是否高亮。
   * @param {THREE.WebGL1Render} [options.renderer] 若pickable设置为true，必须传入场景渲染器。
   * @param {THREE.Scene} [options.scene] 若pickable设置为true，必须传入场景对象。
   * @param {THREE.Camera} [options.camera] 若pickable设置为true，必须传入场景相机。
   * @param {String} [options.pickedColor] 选中地图斑块颜色。
   * @param {Function} [options.onCallback] 选中地图斑块时的回调函数，参数可获取当前被选中的模型。
   * @param {Function} [options.leaveCallback] 离开地图斑块时的回调函数，参数可获取当前离开的模型。
   * @param {Boolean} [options.popup] 是否显示气泡窗口
   * @param {Element} [options.dom] 若显示气泡窗口，必须传入绘制三维场景的canvas所在的div元素
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating ExtrudeMap instance must provide options");
    }
    const features = options.data;
    const center =
      options.projectCenter || this.computeFeaturesCenter(features);
    const depth = options.depth || 2;
    const extrudeOptions = {
      depth: depth,
      mapColor: options.mapColor,
      specularColor: options.specularColor,
      sideColor: options.sideColor
    };
    const lineOptions = {
      color: options.lineColor,
      depth: depth
    };

    const mesh = this.drawMap(features, center, extrudeOptions, lineOptions);
    this.mesh = mesh;

    let popup;
    if (options.popup) {
      popup = new Popup(options.scene, options.camera, options.dom);
      this.popup = popup;
      this.labelRenderer = popup.getCSS2DRenderer();
    }
    if (options.pickable) {
      this.addPicking(options, popup);
    }
  }
  getLabelRenderer() {
    return this.labelRenderer;
  }
  destroy() {
    if (this.popup) {
      this.popup.destroy();
    }
    if (this.pickController) {
      this.pickController.destroy();
    }
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
    this.mesh = null;
  }
  addPicking(options, popup) {
    const pickOptions = {
      renderer: this.labelRenderer || options.renderer,
      scene: options.scene,
      camera: options.camera,
      meshes: this.meshGroup,
      color: options.pickedColor || "#0077D9"
    };
    if (options.onCallback || options.popup) {
      Object.assign(pickOptions, {
        onCallback: object => {
          typeof options.onCallback === "function" &&
            options.onCallback(object);
          if (options.popup) {
            popup.addTo(object);
          }
        }
      });
    }
    if (options.leaveCallback || options.popup) {
      Object.assign(pickOptions, {
        leaveCallback: object => {
          typeof options.leaveCallback === "function" &&
            options.leaveCallback(object);
          if (options.popup) {
            popup.removeFrom(object);
          }
        }
      });
    }
    const pickController = new PickModelController3(pickOptions);
    pickController.startPick();
    this.pickController = pickController;
  }
  drawMap(features, center, extrudeOptions, lineOptions) {
    const meshGroup = new THREE.Group();
    const lineGroup = new THREE.Group();
    features.forEach(feature => {
      feature.geometry.coordinates.forEach(coordinates => {
        coordinates.forEach(points => {
          let points_prj = [];
          points.forEach(point => {
            points_prj.push(this.projection(point, center));
          });
          const shape = this.drawShape(points_prj);
          const item = this.drawExtrude(shape, extrudeOptions);
          item.label = feature.properties.name || "为属性添加name字段";
          const lines = this.drawLine(points_prj, lineOptions);
          lines.forEach(line => {
            lineGroup.add(line);
          });
          meshGroup.add(item);
        });
      });
    });
    this.meshGroup = meshGroup;
    this.lineGroup = lineGroup;
    const group = new THREE.Group();
    group.add(meshGroup, lineGroup);
    return group;
  }
  drawShape(points) {
    var shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.forEach(item => {
      shape.lineTo(item[0], item[1]);
    });
    return shape;
  }
  drawExtrude(shape, options) {
    const extrudeSettings = {
      depth: options.depth,
      bevelEnabled: false
    };
    let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    let material1 = new THREE.MeshPhongMaterial({
      color: options.mapColor || "#161E32",
      specular: options.specularColor || "#545454",
      shininess: 32.0
    });
    const sideColor = options.sideColor || "#008bfb";
    let material2 = new THREE.MeshBasicMaterial({
      color: sideColor
    });
    let mapMesh = new THREE.Mesh(geometry, [material1, material2]);
    mapMesh.name = "mapMesh";
    return mapMesh;
  }
  drawLine(points, options) {
    let geometry1 = new THREE.BufferGeometry();
    let geometry2 = new THREE.BufferGeometry();
    let verticesList1 = [];
    let verticesList2 = [];
    points.forEach(item => {
      verticesList1.push(item[0]);
      verticesList1.push(item[1]);
      verticesList1.push(options.depth);
      verticesList2.push(item[0]);
      verticesList2.push(item[1]);
      verticesList2.push(-0.001);
    });
    const vertices1 = new Float32Array(verticesList1);
    const vertices2 = new Float32Array(verticesList2);
    geometry1.setAttribute("position", new THREE.BufferAttribute(vertices1, 3));
    geometry2.setAttribute("position", new THREE.BufferAttribute(vertices2, 3));
    let lineMaterial = new THREE.LineBasicMaterial({
      color: options.color || "#008bfb"
    });
    let line1 = new THREE.Line(geometry1, lineMaterial);
    let line2 = new THREE.Line(geometry2, lineMaterial);
    line1.name = "line";
    line2.name = "line";
    return [line1, line2];
  }
  projection(point, center) {
    const projection = d3
      .geoMercator()
      .center(center)
      .translate([0, 0])
      .reflectY(90);
    return projection(point);
  }
  computeFeaturesCenter(features) {
    let coordinateList = [];
    features.forEach(feature => {
      feature.geometry.coordinates.forEach(coordinate => {
        coordinate.forEach(points => {
          coordinateList.push(...points);
        });
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
export default ExtrudeMap;
