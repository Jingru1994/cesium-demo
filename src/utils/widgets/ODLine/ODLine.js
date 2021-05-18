import * as THREE from "three"
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from './THREE.MeshLine.js'
var TWEEN = require('@tweenjs/tween.js');

class ODLine {

    mesh
     /**
     * ODLine构造函数
     *
     * @param {Vector3} startPoint 贝塞尔曲线起点
     * @param {Vector3} endPoint 贝塞尔曲线终点
     * @param {Vector3} maxDistaces 所有线段中长度最大值
     * @param {Vector3} minDistance 所有线段中长度最小值
     * @param {Element} options.element canvas容器
     * @param {Object} options 线样式
     * @param {Color} options.isHalf 高亮区域形状
     * @param {Number} options.length 高亮部分在飞线总长度占比
     * @param {Number} options.lineWidth 线宽
     * @param {Color} options.color 线颜色，只设置一个颜色，line和light是同一色系颜色
     * @param {Color} options.lineColor 线颜色，不设置color时，可分别设置line和light颜色
     * @param {Color} options.lightColor 高亮颜色
     * @param {Number} options.duration 单个动画持续时间
     * @param {Number} options.delay 动画之间延迟
     */
    constructor(startPoint, endPoint, maxDistaces, minDistance, options, dom) {
        this.minVal = minDistance
        this.maxVal = maxDistaces
        let points = this.createCubicBezierPoint(startPoint, endPoint)
        let material = this.createODLineMaterial(options,dom)
        let mesh = this.createODLine(points, material)
        this.mesh = mesh
        let duration = options.duration || 3000
        let delay = options.delay || 0
        const tween = new TWEEN.Tween(material.uniforms.offset.value) // 飞线移动动画
            .to({ x: material.uniforms.offset.value.x - 1 }, duration)
            .delay(delay)
            .repeat(Infinity)
            .start();
    }
    get mesh() {
        return this.mesh
    }
    smoothStep(x) {
        let minVal = this.minVal
        let maxVal = this.maxVal
        let t = this.clamp((x - minVal)/(maxVal - minVal), 0, 1)
        return t*t*(3-2*t)
    }
    clamp(x, minVal, maxVal) {
        return Math.min(Math.max(x,minVal),maxVal)
    }
    createODLine(points, material) {
        let verticesList = []
        points.forEach(item => {
            verticesList.push(item.x)
            verticesList.push(item.y)
            verticesList.push(item.z)
        })
        const vertices = new Float32Array(verticesList)
        // const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
        
        const meshline = new MeshLine()
        meshline.setPoints(vertices)
        const mesh = new THREE.Mesh(meshline,material)
        return mesh
    }
    createCubicBezierPoint(startPoint, endPoint) {
        let v0, v1, v2, v3
        let n
        v0 = startPoint
        v3 = endPoint
        //当数据在球体上时v1和v2的算法
        // const angle = v0.angleTo(v3)
        // vtop = vtop.normalize().multiplyScalar(50)
        // if (angle <= 1) {
        //     n = (100 / 5) * angle;
        // } else if (angle > 1 && angle < 2) {
        //     n = (100 / 5) * Math.pow(angle, 2);
        // } else {
        //     n = (100 / 5) * Math.pow(angle, 1.5);
        // }
        // v1 = v0.clone().add(vtop).normalize().multiplyScalar(50+n)
        // v2 = v3.clone().add(vtop).normalize().multiplyScalar(50+n)
        const distance = v0.distanceTo(v3)
        let factor = this.smoothStep(distance)
        v1 = new THREE.Vector3((v3.x-v0.x)/4+v0.x,(v3.y-v0.y)/4+v0.y,2+factor*5)//只要考虑xy坐标，z直接给个高度就行
        v2 = new THREE.Vector3((v3.x-v0.x)/4*3+v0.x,(v3.y-v0.y)/4*3+v0.y,2+factor*5)
        const curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3)
        const points = curve.getPoints(500)
        return points
    }
    createODLineMaterial(options,dom) {
        let length = options.length || 0.1
        let lineColor = options.lineColor || 'rgba(255,255,255,0.2)'
        let lightColor = options.lightColor || 'rgba(255,255,255,1)'
        let isHalf = typeof options.isHalf !== 'undefined' ? options.isHalf : true
        let lineWidth = options.lineWidth || 2
        let color = options.color || new THREE.Color("rgb(255, 255, 255)")
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')
        const gradient = ctx.createLinearGradient(0, 0, 256, 1)
        gradient.addColorStop(0, lineColor)
        gradient.addColorStop(isHalf ? length : length / 2, lightColor)
        gradient.addColorStop(length, lineColor)
        gradient.addColorStop(length, lineColor)
        gradient.addColorStop(1, lineColor)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 256, 1)
        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping

        const material = new MeshLineMaterial({
            map: texture,             // 材质
            useMap: true,             // 使用材质
            lineWidth: lineWidth,     // 线宽
            sizeAttenuation: false,   // 是否随距离衰减
            transparent: true,        // 开启透明度
            color: color
        });

        const width = dom.width
        const height = dom.height
        material.uniforms.resolution.value.set(width, height);
        return material
    }
    addTo(scene) {
        scene.add(this.mesh)
    }
}

export default ODLine