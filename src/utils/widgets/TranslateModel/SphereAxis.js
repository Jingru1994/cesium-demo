import Axis from './Axis'
import Cartesian3 from 'cesium/Core/Cartesian3'
import PolylineGeometry from 'cesium/Core/PolylineGeometry'
import Transforms from 'cesium/Core/Transforms'
import Primitive from 'cesium/Scene/Primitive'
import GeometryInstance from 'cesium/Core/GeometryInstance'
import ColorGeometryInstanceAttribute from 'cesium/Core/ColorGeometryInstanceAttribute'
import PolylineColorAppearance from 'cesium/Scene/PolylineColorAppearance'
import CesiumMath from 'cesium/Core/Math'

class AxisSphere extends Axis {

    id = ''

    /**
     * 轴位置
     * @type {[]}
     */
    position = []

    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction = null

    /**
     * 轴的角度
     * @type {number}
     */
    angle = 0

    /**
     * 构造一个旋转轴
     * @param id{string} id
     * @param radius{number} 半径
     * @param position{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     */
    constructor (id, radius, position, color) {
        super()
        this.id = id
        this._color = color
        this._calculation(radius, position)
        this._createAxisSphere(id, position, color)
    }

    /**
     * 创建圆环轴
     * @param id{string} id
     * @param matrix{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     * @private
     */
    _createAxisSphere(id, position, color) {
        const matrix = Transforms.eastNorthUpToFixedFrame(position)
        const geometry = new PolylineGeometry({
            positions: this.position,
            width: 10
        });
        const instance = new GeometryInstance({
            geometry: geometry,
            id: id,
            attributes: {
                color: ColorGeometryInstanceAttribute.fromColor(color)
            }
        });
        this.primitive = new Primitive({
            geometryInstances: instance,
            appearance: new PolylineColorAppearance({
                translucent: false
            }),
            modelMatrix: matrix
        });
    }

    /**
     * 计算轴圆弧位置
     * @param radius{number}
     */
    _calculation (radius, position) {
        for (let i = 0; i <= 360; i += 3) {
            const sin = Math.sin(CesiumMath.toRadians(i));
            const cos = Math.cos(CesiumMath.toRadians(i));
            const x = radius * cos;
            const y = radius * sin;
            this.position.push(new Cartesian3(x, y, 0));
        }
    }

    /**
     * 更新轴的角度
     * @param angle
     */
    updateAngle(angle) {
        this.angle += angle
        if(this.angle >= 360 || this.angle <= 360) {
            this.angle = 0
        }
    }

    /**
     * 选中
     */
    select () {
        this.selected = true
    }

    // 复位颜色
    rest () {
        this.selected = false
    }
}
export default AxisSphere