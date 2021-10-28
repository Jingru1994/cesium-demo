import Material from "cesium/Scene/Material.js";
import Color from "cesium/Core/Color.js";
import Cartesian2 from "cesium/Core/Cartesian2.js";

const WallImageTrailMaterial = require("./WallImageTrailMaterial.glsl");

Material.WallImageTrailType = "WallImageTrail";
Material._materialCache.addMaterial(Material.WallImageTrailType, {
  fabric: {
    type: Material.WallImageTrailType,
    uniforms: {
      image: Material.DefaultImageId,
      color: new Color(0.0, 1.0, 0.0, 1.0),
      speed: 3.0,
      repeat: new Cartesian2(1, 1)
    },
    source: WallImageTrailMaterial
  },
  translucent: function() {
    return true;
  }
});
