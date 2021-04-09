import Primitive from 'cesium/Scene/Primitive.js'
// import GroundPrimitive from 'cesium/Scene/GroundPrimitive.js'
import GroundPolylinePrimitive from 'cesium/Scene/GroundPolylinePrimitive.js'
import GeometryInstance from 'cesium/Core/GeometryInstance.js'
import PolylineGeometry from 'cesium/Core/PolylineGeometry.js'
import GroundPolylineGeometry from 'cesium/Core/GroundPolylineGeometry.js'
import PolylineMaterialAppearance from 'cesium/Scene/PolylineMaterialAppearance.js'
import Material from 'cesium/Scene/Material.js'
import './PolylineFlowMaterial.js'
import Color from 'cesium/Core/Color.js'


class FlowLinePrimitive {
    constructor(primitiveCollection, options) {
        this._primitiveCollection = primitiveCollection
        this._options = options
        this._positions = this._options.positions
        this._width = this._options.width
        this._style = this._options.style
        this._clampToGround = this._options.clampToGround
        if(this._clampToGround) {
            let polyline = new GroundPolylineGeometry({
                positions: this._positions,
                width: this._width
            })
            this._primitive = new GroundPolylinePrimitive({
                geometryInstances: new GeometryInstance({
                    geometry: polyline
                })
            })
        }else {
            let polyline = new PolylineGeometry({
                positions: this._positions,
                width: this._width
            })
            this._primitive = new Primitive({
                geometryInstances: new GeometryInstance({
                    geometry: polyline
                })
            })
        }

        this._add()
  }

    set show(show) {
        this._primitive.show = show
        return this
    }

    get show() {
        return this._primitive.show
    }

    set positions(positions) {
        this._positions = positions
        this._primitive.geometryInstances.geometry = new PolylineGeometry({
            positions: this._positions,
            width: this._width
        })
        return this
    }

    get positions() {
        return this._positions
    }
    _setAppearance() {
        this._primitive.appearance = new PolylineMaterialAppearance({
            material: Material.fromType('PolylineFlow', {
                color: this._style?.color || new Color(1.0, 0.0, 0.0, 0.7),
                speed: this._style?.speed || 1,
                percent: this._style?.percent || 0.03,
                gradient: this._style?.gradient || 0.1
            })
        })
    }

    _add() {
        this._style.classificationType &&
            (this._primitive.classificationType = this._style.classificationType)
        this._setAppearance()
        // this._primitive.geometryInstances.geometry = new PolylineGeometry({
        //     positions: this._positions,
        //     width: this._width
        // })
        this._primitiveCollection.add(this._primitive)
    }
    remove() {
        this._primitiveCollection.remove(this._primitive)
    }
    setStyle(style = {}) {
        if (Object.keys(style).length === 0) {
            return this
        }
        this._style = style
        style.classificationType &&
            (this._primitive.classificationType = this._style.classificationType)
        this._setAppearance()
        return this
    }
}

export default FlowLinePrimitive
