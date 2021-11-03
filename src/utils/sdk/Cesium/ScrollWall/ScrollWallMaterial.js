import Material from "cesium/Scene/Material.js";
import Color from "cesium/Core/Color.js";

import ScrollWallMaterial from "./ScrollWallMaterial.glsl";

Material.WallScrollType = "WallTrail";
Material._materialCache.addMaterial(Material.WallScrollType, {
  fabric: {
    type: Material.WallScrollType,
    uniforms: {
      color: new Color(1.0, 0.0, 0.0, 0.7),
      image: Material.DefaultImageId,
      speed: 1
    },
    source: ScrollWallMaterial
  },
  translucent: function() {
    return true;
  }
});
