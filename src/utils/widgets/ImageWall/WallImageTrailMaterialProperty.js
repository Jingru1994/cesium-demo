import Property from "cesium/DataSources/Property.js";
import createPropertyDescriptor from "cesium/DataSources/createPropertyDescriptor.js";
import Event from "cesium/Core/Event.js";
import defaultValue from "cesium/Core/defaultValue.js";
import Material from "cesium/Scene/Material.js";
import Cartesian2 from "cesium/Core/Cartesian2.js";
import Color from "cesium/Core/Color.js";
import "./WallImageTrailMaterial.js";

class WallImageTrailMaterialProperty {
  constructor(options = {}) {
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this._speed = undefined;
    this._speedSubscription = undefined;
    this._image = undefined;
    this._imageSubscription = undefined;
    this._repeat = undefined;
    this._repeatSubscription = undefined;
    this.color = options.color || Color.fromBytes(0, 255, 255, 255);
    this.speed = options.speed || 1;
    this.image = options.image;
    this.repeat = new Cartesian2(
      options.repeat?.x || 1,
      options.repeat?.y || 1
    );
    debugger;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType() {
    return Material.WallImageTrailType;
  }

  getValue(time, result) {
    result = defaultValue(result, {});
    result.color = Property.getValueOrUndefined(this._color, time);
    result.image = Property.getValueOrUndefined(this._image, time);
    result.repeat = Property.getValueOrUndefined(this._repeat, time);
    result.speed = this._speed;
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof WallImageTrailMaterialProperty &&
        Property.equals(this._color, other._color) &&
        Property.equals(this._image, other._image) &&
        Property.equals(this._repeat, other._repeat) &&
        Property.equals(this._speed, other._speed))
    );
  }
}

Object.defineProperties(WallImageTrailMaterialProperty.prototype, {
  image: createPropertyDescriptor("image"),
  color: createPropertyDescriptor("color"),
  speed: createPropertyDescriptor("speed"),
  repeat: createPropertyDescriptor("repeat")
});

export default WallImageTrailMaterialProperty;
