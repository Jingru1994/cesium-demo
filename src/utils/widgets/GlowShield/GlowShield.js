/*
 * @Author: your name
 * @Date: 2021-06-17 14:44:45
 * @LastEditTime: 2021-06-21 11:02:11
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \cesium-demo\src\utils\widgets\GlowShield\GlowShield.js
 */
import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"


class GlowShield {

    mesh
     /**
     * GradieCircle构造函数
     *
     * @param {Object} options 半球样式
     * @param {Vector3} options.center 半球位置
     * @param {Number} options.radius 半球半径
     * @param {Color} options.color 半球颜色
     */
    constructor(options) {
        let radius = options && options.radius || 5
        let position = options && options.center || new THREE.Vector3(0,0,0)
        let material = this.createMaterial(options)
        this.material = material
        const geometry = new THREE.SphereGeometry(radius, 32, 32, 0, 2*Math.PI, 0, Math.PI/2)
        let mesh = new THREE.Mesh(geometry,material)
        mesh.rotation.x = Math.PI / 2
        mesh.position.copy(position)
        this.mesh = mesh
        this.animate(material)
    }
    get mesh() {
        return this.mesh
    }
    createMaterial(options) {
        let color = (options && options.color) || new THREE.Color('rgb(85,187,237)')
        let vertex = `
            varying vec3 vNormal;
            varying vec3 vPositionNormal;
            void main()
            {
                //normal法向量  normalMatrix inverse transpose of modelViewMatrix normalize归一化,将物体坐标系下的法向量转为视图坐标系下法向量方向
                vNormal = normalize(normalMatrix * normal);
                vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `
        let fragment = `
            uniform vec3 glowColor;
            uniform float b;
            uniform float p;
            uniform float s;
            varying vec3 vNormal;
            varying vec3 vPositionNormal;

            void main() {
                float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );
                a = clamp(a, 0.2, 0.9);
                gl_FragColor = vec4( glowColor, a );

            }
        `
        const material = new THREE.ShaderMaterial({
            uniforms: {
                s: { type: "f", value: -1.0},
                b: { type: "f", value: 1.0},
                p: { type: "f", value: 1.0 },
                glowColor: {
                    type: 'v3',
                    value: color
                },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide,
            depthWrite: false,
            transparent: true,
        })
        return material
    }
    addTo(scene) {
        scene.add(this.mesh)
    }
    animate() {
        this.start = requestAnimationFrame(this.animate.bind(this))
        TWEEN.update()

    }
    stop() {
        if(this.start) {
            cancelAnimationFrame(this.start)
        }
        
    }
}

export default GlowShield