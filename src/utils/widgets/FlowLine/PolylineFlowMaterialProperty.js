import Property from 'cesium/DataSources/Property.js'
import createPropertyDescriptor from 'cesium/DataSources/createPropertyDescriptor.js'
import Event from 'cesium/Core/Event.js'
import Material from 'cesium/Scene/Material.js'

class PolylineFlowMaterialProperty{
    constructor(options = {}) {
        this._definitionChanged = new Event()
        this._percent = undefined
        this._percentSubscription = undefined
        this._gradient = undefined
        this._gradientSubscription = undefined
        this._color = undefined
        this._colorSubscription = undefined
        this._speed = undefined
        this._speedSubscription = undefined
        this.percent = options.percent || 0.03
        this.gradient = options.gradient || 0.1
        this.color = options.color || Cesium.Color.fromBytes(0, 255, 255, 255)
        this.speed = options.speed || 1
        this._time = (new Date()).getTime()
        this.isTranslucent = function () {
            return true;
        }
    }

    get isConstant() {
        return false
    }

    get definitionChanged() {
        return this._definitionChanged
    }

    getType(time) {
        return Material.PolylineFlowType
    }

    getValue(time, result) {
        if (!result) {
            result = {}
        }
        result.color = Property.getValueOrUndefined(this._color, time)
        result.speed = this._speed
        result.percent = this._percent
        result.gradient = this._gradient
        return result
    }

    equals(other) {
        return (
        this === other ||
        (other instanceof PolylineFlowMaterialProperty &&
            Property.equals(this._color, other._color) &&
            Property.equals(this._speed, other._speed) &&
            Property.equals(this._percent, other._percent) &&
            Property.equals(this._gradient, other._gradient))
        )
    }
}

Object.defineProperties(PolylineFlowMaterialProperty.prototype, {
    color: createPropertyDescriptor('color'),
    speed: createPropertyDescriptor('speed'),
    percent: createPropertyDescriptor('percent'),
    gradient: createPropertyDescriptor('gradient')
})


export default PolylineFlowMaterialProperty
