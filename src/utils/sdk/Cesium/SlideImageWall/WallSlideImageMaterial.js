import Material from "cesium/Scene/Material.js";
import Color from "cesium/Core/Color.js";
import Cartesian2 from "cesium/Core/Cartesian2.js";

import WallImageMaterial from "./WallSlideImageMaterial.glsl";

Material.WallSlideImageType = "WallSlideImage";
Material._materialCache.addMaterial(Material.WallSlideImageType, {
  fabric: {
    type: Material.WallSlideImageType,
    uniforms: {
      image: Material.DefaultImageId,
      color: new Color(0.0, 1.0, 0.0, 1.0),
      speed: 3.0,
      repeat: new Cartesian2(1, 1)
    },
    source: WallImageMaterial
  },
  translucent: function() {
    return true;
  }
});
