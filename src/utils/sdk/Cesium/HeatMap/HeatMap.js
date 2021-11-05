import Rectangle from "cesium/Core/Rectangle.js";
import Entity from "cesium/DataSources/Entity.js";
import ImageMaterialProperty from "cesium/DataSources/ImageMaterialProperty.js";
import EntityCollection from "cesium/DataSources/EntityCollection.js";
import h337 from "./heatmap.min.js";

/**
 * 热力图
 *
 * @author Dongjingru
 * @alias HeatMap
 * @constructor
 * @param {Object} options 参数
 */
class HeatMap {
  /**
   * 创建流动线。
   *
   * @param {Object} options 选项。
   * @param {Array} options.positions 生成热力图的数据点集，格式为[[x,y[,value]],...]
   * @param {Object} [options.heatmapOptions] heatmap.js配置项，生成热力图的图例等可选项。
   * @param {String} [options.heatmapOptions.backgroundColor] 热力图背景色。
   * @param {Object} [options.heatmapOptions.gradient] 热力图图例。
   * @param {Number} [options.heatmapOptions.radius] 单个数据点半径。
   * @param {Number} [options.heatmapOptions.opacity] 热力图整体透明，会覆盖maxOpacity和minOpacity。
   * @param {Number} [options.heatmapOptions.opacity] 热力图整体透明，会覆盖maxOpacity和minOpacity。
   */
  constructor(options) {
    this._hOptions = {
      maxOpacity: 0.6, // the maximum opacity used if not given in the heatmap options object
      minOpacity: 0.1, // the minimum opacity used if not given in the heatmap options object
      blur: 0.85, // the blur used if not given in the heatmap options object
      radius: 25,
      // backgroundColor: 'rgba(0,0,0,.95)',
      gradient: {
        "0.4": "blue",
        "0.6": "green",
        "0.8": "yellow",
        "0.9": "red"
      },
      maxCanvasSize: 2500,
      minCanvasSize: 2000
    };
    this._hOptions = {
      ...this._hOptions,
      ...options.heatmapOptions
    };

    this._hOptions.spacing = this._hOptions.radius * 1.5;
    this._heatmap = undefined;
    const positions = options.positions;
    this._bounds = this._getBounds(positions);
    this._scale = 1;
    const material = this._createMaterial(
      this._bounds,
      this._hOptions,
      positions
    );
    this._heatmapEntity = new Entity();
    this._initEntity(this._bounds, material);
    console.log(this._heatmapEntity);
  }

  set show(show) {
    this._heatmapEntity.show = show;
    return this;
  }
  get show() {
    return this._heatmapEntity.show;
  }

  _getBounds(positions = [], expand = 0) {
    let minLng = 180;
    let minLat = 90;
    let maxLng = -180;
    let maxLat = -90;
    positions.forEach(item => {
      minLng = Math.min(minLng, item.lng || item.x);
      minLat = Math.min(minLat, item.lat || item.y);
      maxLng = Math.max(maxLng, item.lng || item.x);
      maxLat = Math.max(maxLat, item.lat || item.y);
    });

    if (expand > 0) {
      let diffLng = Math.abs(maxLng - maxLng);
      let diffLat = Math.abs(maxLat - minLat);
      minLng -= diffLng * expand;
      minLat -= diffLat * expand;
      maxLng += diffLng * expand;
      maxLat += diffLat * expand;
    }
    return {
      west: minLng,
      south: minLat,
      east: maxLng,
      north: maxLat
    };
  }
  _createMaterial(bounds, options, positions) {
    let canvasContainer = document.getElementById("hcr3d-cesium-heatmap");
    if (!canvasContainer || this._determineBoundsChange()) {
      if (canvasContainer) {
        canvasContainer.parentNode.removeChild(canvasContainer);
      }
      canvasContainer = document.createElement("div");
      canvasContainer.id = "hcr3d-cesium-heatmap";
      canvasContainer.style.display = "none";
      document.body.appendChild(canvasContainer);
      options.container = canvasContainer;
    }

    this._setCanvasSize(bounds, options);
    this._heatmap = h337.create(options);
    const data = this._processData(positions);
    const minValue = Math.min(
      ...data.map(item => {
        return item.value;
      })
    );
    const maxValue = Math.max(
      ...data.map(item => {
        return item.value;
      })
    );
    this._heatmap.setData({
      min: minValue,
      max: maxValue,
      data
    });
    let material = new ImageMaterialProperty({
      image: this._heatmap._renderer.canvas,
      transparent: true
    });
    return material;
  }
  _determineBoundsChange() {
    if (!this._oldBounds) return true;
    Object.keys(this._bounds).forEach(key => {
      if (this._bounds[key] !== this._oldBounds[key]) {
        return true;
      }
    });
    return false;
  }
  _setCanvasSize(bounds, options) {
    let diffLng = Math.abs(bounds.east - bounds.west);
    let diffLat = Math.abs(bounds.north - bounds.south);
    let max = Math.max(diffLng, diffLat);
    let min = Math.min(diffLng, diffLat);
    let scale = 1;
    let space = options.spacing;
    if (max > options.maxCanvasSize + 2 * space) {
      scale = max / (options.maxCanvasSize + 2 * space);
      if (min / scale < options.minCanvasSize + 2 * space) {
        scale = min / (options.minCanvasSize + 2 * space);
      }
    } else if (min < options.minCanvasSize + 2 * space) {
      scale = min / (options.minCanvasSize + 2 * space);
      if (max / scale > options.maxCanvasSize + 2 * space) {
        scale = max / (options.maxCanvasSize + 2 * space);
      }
    }
    options.container.style.height = diffLat / scale + 2 * space + "px";
    options.container.style.width = diffLng / scale + 2 * space + "px";
    this._scale = scale;
  }
  _processData(positions) {
    let data = [];
    positions.forEach(item => {
      let coord = this._transformWGS84ToHeatmap({
        lng: item.lng || item.x,
        lat: item.lat || item.y
      });
      data.push({
        x: coord.x,
        y: coord.y,
        value: item.value || 1
      });
    });
    return data;
  }
  _transformWGS84ToHeatmap(position) {
    let coord = {};
    coord.x = Math.round(
      (position.lng - this._bounds.west) / this._scale + this._hOptions.spacing
    );
    coord.y = Math.round(
      (position.lat - this._bounds.south) / this._scale + this._hOptions.spacing
    );
    coord.y = this._heatmap._renderer.canvas.height - coord.y;
    return coord;
  }
  _initEntity(initBounds, material) {
    let offset = this._hOptions.spacing * this._scale;
    let bounds = Rectangle.fromDegrees(
      initBounds.west - offset,
      initBounds.south - offset,
      initBounds.east + offset,
      initBounds.north + offset
    );
    this._heatmapEntity.rectangle = {
      coordinates: bounds,
      fill: true,
      material: material
    };
  }

  changePositions(positions) {
    this._oldBounds = JSON.parse(JSON.stringify(this._bounds));
    this._bounds = this._getBounds(positions);
    this._scale = 1;
    const material = this._createMaterial(
      this._bounds,
      this._hOptions,
      positions
    );
    this._initEntity(this._bounds, material);
  }
  setOptions(options) {
    this._hOptions = {
      ...this._hOptions,
      ...options
    };
    this._hOptions.spacing = this._hOptions.radius * 1.5;
    this._heatmap.configure(this._hOptions);
    let material = new ImageMaterialProperty({
      image: this._heatmap._renderer.canvas,
      transparent: true
    });
    this._heatmapEntity.rectangle.material = material;
  }
  addTo(container) {
    if (!container) return;
    this._container = container;
    if (container instanceof EntityCollection) {
      container.add(this._heatmapEntity);
    } else {
      container.entities.add(this._heatmapEntity);
    }
  }
  remove() {
    if (this._heatmapEntity) {
      this._container.remove(this._heatmapEntity);
    }
  }
}

export default HeatMap;
