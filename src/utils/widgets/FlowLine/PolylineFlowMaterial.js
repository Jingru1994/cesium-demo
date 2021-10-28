import Material from "cesium/Scene/Material.js";
import Color from "cesium/Core/Color.js";

const LineFlowMaterial = require("./PolylineFlowMaterial.glsl");

Material.PolylineFlowType = "PolylineFlow";
Material._materialCache.addMaterial(Material.PolylineFlowType, {
  fabric: {
    type: Material.PolylineFlowType,
    uniforms: {
      color: new Color(1.0, 0.0, 0.0, 0.7),
      speed: 1,
      percent: 0.03,
      gradient: 0.1
    },
    source: LineFlowMaterial
  },
  translucent: function() {
    return true;
  }
});
