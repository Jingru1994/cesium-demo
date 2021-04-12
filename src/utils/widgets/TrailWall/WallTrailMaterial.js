import Material from 'cesium/Scene/Material.js'
import Color from 'cesium/Core/Color.js'

const WallTrailMaterial = require('./WallTrailMaterial.glsl')

Material.WallTrailType = 'WallTrail'
Material._materialCache.addMaterial(Material.WallTrailType, {
    fabric: {
        type: Material.WallTrailType,
        uniforms: {
            color: new Color(1.0, 0.0, 0.0, 0.7),
            image: Material.DefaultImageId,
            speed: 1
        },
        source: WallTrailMaterial
    },
    translucent: function(material) {
        return true
    }
})
