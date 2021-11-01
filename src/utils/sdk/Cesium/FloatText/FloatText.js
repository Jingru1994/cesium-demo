import Rectangle from "cesium/Core/Rectangle.js";
import ImageMaterialProperty from "cesium/DataSources/ImageMaterialProperty.js";
import CesiumMath from "cesium/Core/Math.js";
import HeightReference from "cesium/Scene/HeightReference.js";
import RectangleGraphics from "cesium/DataSources/RectangleGraphics.js";
import Entity from "cesium/DataSources/Entity.js";
import EntityCollection from "cesium/DataSources/EntityCollection.js";

/**
 * 浮动文字
 *
 * @author Dongjingru
 * @alias FloatText
 * @constructor
 * @param {Object} options 参数
 */
class FloatText {
  /**
   * 创建一个Div地物标志。
   *
   * @param {Object} options 选项。
   * @param {Array} options.position 位置[经度，纬度]
   * @param {Number} options.height 高度
   * @param {String} options.text 文本内容
   * @param {Number} options.rotation 元素方向
   * @param {Number} options.size 元素大小
   * @param {Number} options.color 颜色
   * @param {Object} options.font 文字字体
   * @param {String} options.font.style 文字斜体
   * @param {String} options.font.variant 文字变体
   * @param {String} options.font.weight 文字粗细程度
   * @param {String} options.font.family 文字字体
   */
  constructor(options) {
    if (!options) {
      throw Error("Creating FloatText instance must provide options");
    }
    const text = options.text || "标签";
    const size = options.size || 1;
    const font = options.font;
    const color = options.color || "#ffffff";
    const materialImage = FloatText.createTextCanvas(text, size, color, font);
    const length = text.length;
    const position = { lon: options.position[0], lat: options.position[1] };
    const rectangle = FloatText.getRectangle(position, length, size);
    const rotation = options.rotation || 0;
    const floatText = FloatText.createTextEntity(
      rectangle,
      rotation,
      text,
      materialImage
    );
    this.floatText = floatText;
  }
  /**
   * 将Div地物标志添加到viewer中显示。
   *
   * @param {Viewer} viewer 将添加div地物标志的地图viewer
   * @ignore
   */
  addTo(container) {
    if (!container) return;
    if (container instanceof EntityCollection) {
      container.add(this.floatText);
    } else {
      container.entities.add(this.floatText);
    }
  }
  /**
   * 获取地物标志的div元素
   * @return {Element} div元素
   */
  getElement() {
    return this.element;
  }
  /**
   * 获取div元素偏移量
   *
   * @param {Element} element 弹窗元素。
   * @param {Object} options 创建DivGraphic实例传入参数。
   * @return {Array} div元素偏移量
   */
  static createTextEntity(rectangle, rotation, text, textImage) {
    let rectangleOptions = {
      coordinates: rectangle,
      material: new ImageMaterialProperty({
        image: textImage,
        transparent: true
        // color: Cesium.Color.WHITE
      }),
      rotation: CesiumMath.toRadians(rotation),
      stRotation: CesiumMath.toRadians(rotation),
      height: 50,
      heightReference: HeightReference.RELATIVE_TO_GROUND
    };
    let rectangleGraphics = new RectangleGraphics(rectangleOptions);
    let entityOptions = {
      name: text,
      rectangle: rectangleGraphics
    };
    let entity = new Entity(entityOptions);
    return entity;
  }
  static getRectangle(positon, length, size) {
    let minLon = positon.lon - (length * 0.00035 * size) / 2;
    let maxLon = positon.lon + (length * 0.00035 * size) / 2;
    let minLat = positon.lat - 0.000175 * size;
    let maxLat = positon.lat + 0.000175 * size;
    let rectangle = Rectangle.fromDegrees(minLon, minLat, maxLon, maxLat);
    return rectangle;
  }
  static createTextCanvas(text, size, color, font) {
    const fontSize = Number(size) * 100;
    const fontStyle = font.style || "normal";
    const fontVariant = font.variant || "";
    const fontWeight = font.weight || "normal";
    const fontFamily = font.family || "微软雅黑";

    let c = document.createElement("canvas");
    const d = (text + "").length * fontSize;
    c.width = d;
    c.height = fontSize;
    let ctx = c.getContext("2d");

    ctx.fillStyle = color;
    ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`; //设置字体
    ctx.textBaseline = "hanging"; //在绘制文本时使用的当前文本基线
    //绘制文本
    ctx.fillText(text, 0, 0);
    return c;
  }
}

export default FloatText;
