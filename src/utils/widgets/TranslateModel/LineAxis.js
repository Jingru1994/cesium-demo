import Axis from './Axis'
import Cartesian3 from 'cesium/Core/Cartesian3'
import CylinderGeometry from 'cesium/Core/CylinderGeometry'
import Color from 'cesium/Core/Color'
import Transforms from 'cesium/Core/Transforms'
import Primitive from 'cesium/Scene/Primitive'
import GeometryInstance from 'cesium/Core/GeometryInstance'
import MaterialAppearance from 'cesium/Scene/MaterialAppearance'
import Material from 'cesium/Scene/Material'

class ArrowPolyline extends Axis {

    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction = null

    /**
     * 哪个轴
     * @type {Cartesian3}
     */
    unit = null

    /**
     * 箭头线
     */
    constructor(option = {},viewer) {
        super()
        this.viewer = viewer
        this._color = option.color || Color.RED;
        this._width = option.width || 3;
        this._headWidth = option.headWidth || 2 * this._width;
        this._length = option.length || 300
        this._headLength = option.headLength || 10
        this._inverse = option.inverse || false
        this.position = option.position
        this.direction = option.direction
        this.unit = option.unit
        const id = option.id
        //这里用的是圆锥几何对象，当topRadius和bottomRadius相同时，它就是一个圆柱
        const line = CylinderGeometry.createGeometry(new CylinderGeometry({
            length: this._length,
            topRadius: this._width,
            bottomRadius: this._width
        }));
        const arrow = CylinderGeometry.createGeometry(new CylinderGeometry({
            length: this._headLength,
            topRadius: 0,
            bottomRadius: this._headWidth
        }));
        let offset = (this._length + this._headLength) / 2
        if (this._inverse) {
            offset = -offset
        }

        this.translate(arrow, [0, 0, offset]);
        const modelMatrix = Transforms.eastNorthUpToFixedFrame(this.position)
        this.primitive = new Primitive({
            modelMatrix: modelMatrix,
            geometryInstances: [new GeometryInstance(
                {
                    id: id + '-line',
                    geometry: line,
                }
            ),
            new GeometryInstance({
                id: id + '-arrow',
                geometry: arrow,
            })],
            appearance: new MaterialAppearance({
                material: Material.fromType('Color', { color: this._color })
            }),
            asynchronous: false
        });
        // this.viewer.scene.primitives.add(this.primitive)
        
    }

    /**
     * 按上面的方法画出的箭头在线的中间，我们需要把它平移到线的一端
     */
    translate (geometry, offset) {
        const scratchOffset = new Cartesian3();
        if (Array.isArray(offset)) {
            scratchOffset.x = offset[0];
            scratchOffset.y = offset[1];
            scratchOffset.z = offset[2];
        } else {
            Cartesian3.clone(offset, scratchOffset);
        }

        for (let i = 0; i < geometry.attributes.position.values.length; i += 3) {
            geometry.attributes.position.values[i] += scratchOffset.x;
            geometry.attributes.position.values[i + 1] += scratchOffset.y;
            geometry.attributes.position.values[i + 2] += scratchOffset.z;
        }
    }
}

export default ArrowPolyline