import Property from "cesium/DataSources/Property.js";
import createPropertyDescriptor from "cesium/DataSources/createPropertyDescriptor.js";
import Event from "cesium/Core/Event.js";
import Material from "cesium/Scene/Material.js";
import Color from "cesium/Core/Color.js";
import "./ScrollWallMaterial.js";

import IMG from "../Assets/Images/scrollWall.png";

class ScrollWallMaterialProperty {
  constructor(options = {}) {
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this._speed = undefined;
    this._speedSubscription = undefined;
    this._image = undefined;
    this._imageSubscription = undefined;
    this.color = options.color || Color.fromBytes(255, 255, 255, 255);
    this.speed = options.speed || 1;
    this.image = IMG;
  }

  get isConstant() {
    return false;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }

  getType() {
    return Material.WallScrollType;
  }

  getValue(time, result) {
    if (!result) {
      result = {};
    }
    result.color = Property.getValueOrUndefined(this._color, time);
    result.image = Property.getValueOrUndefined(this._image, time);
    result.speed = this._speed;
    return result;
  }

  equals(other) {
    return (
      this === other ||
      (other instanceof ScrollWallMaterialProperty &&
        Property.equals(this._color, other._color) &&
        Property.equals(this._speed, other._speed))
    );
  }
}

Object.defineProperties(ScrollWallMaterialProperty.prototype, {
  color: createPropertyDescriptor("color"),
  speed: createPropertyDescriptor("speed"),
  image: createPropertyDescriptor("image")
});

export default ScrollWallMaterialProperty;
