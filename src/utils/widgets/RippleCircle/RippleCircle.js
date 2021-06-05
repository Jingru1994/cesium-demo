import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"
import TweenEasingType from "./TweenEasingType.js"
// var TWEEN = require('@tweenjs/tween.js')


class SpreadCircle {

    mesh
    material
    static START
    static MY_TWEEN
     /**
     * SpreadCircle构造函数
     *
     * @param {Object} options 阔散圆样式
     * @param {Vector3} options.center 扩散圆位置
     * @param {Number} options.radius 扩散圆半径
     * @param {Color} options.color 圆环颜色
     * @param {Number} options.initRadius 圆环初始半径
     * @param {Number} options.width 圆环半径
     * @param {Number} options.duration 单个动画持续时间
     * @param {String} options.easingType 动画类型，可选项可从TweenEasingType.js查看
     */
    constructor(options) {
        let radius = options && options.radius || 20
        this.radius = radius
        this.options = options
        let material = this.createSpreadCircleMaterial(options)
        this.material = material
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        let geometry = new THREE.CircleGeometry(radius,120)
        let mesh = new THREE.Mesh(geometry,material)
        let position = options && options.center || new THREE.Vector3(0,0,0)
        mesh.position.copy(position)
        this.mesh = mesh
        // let duration = options && options.duration || 3000
        // let easingType = options && options.easingType || 'cubicOut'
        // SpreadCircle.MY_TWEEN = new TWEEN.Tween(material.uniforms.radius)
        //     .to({value:radius}, duration)
        //     .easing(TweenEasingType[easingType])
        //     .repeat(Infinity)
        //     .start()
        // // this.animate(material,radius,options)
        // this.animate()
    }
    get mesh() {
        return this.mesh
    }
    createSpreadCircleMaterial(options) {
        let color = options && options.color || new THREE.Color("rgb(255, 255, 255)")
        let annulus_radius = options && options.initRadius || this.radius/10
        let width = options && options.width || this.radius/10
        console.log(annulus_radius)
        
        let uniforms = {
            color: {
                value: color
            },
            radius: {
                value: 0.8
            },
            initRadius: {
                value: 0.8
            }
        }
        this.uniforms = uniforms
        let vertexShader = `
            varying vec3 vPosition;
            void main(){
                vPosition=position;
                gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `
        let fragmentShader = `
            varying vec3 vPosition;
            uniform vec3 color;
            uniform float radius;
            uniform float initRadius;
            uniform float width;

            void main(){
                float dis = distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
                float w = initRadius/20.0; //width
                float intv = (initRadius - w *3.0) / 3.0; //interval
                if(dis < intv || (dis > (intv + w) && dis < (intv * 2.0 + w)) || (dis > (intv + w)*2.0 && dis < (intv * 3.0 + w * 2.0))) {
                    gl_FragColor = vec4(1.0,0.0,0.0,0);
                }else {
                    gl_FragColor = vec4(color, 0.8);
                }
                
            }
        `

        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            
        });
        return material
    }
    animate() {
        // this.material.uniforms.radius.value += 0.1;//不使用tween动画，线性扩散
		// if (this.material.uniforms.radius.value >= this.radius) {
        //     console.log('a')
        //     console.log(this.options.initRadius)
		// 	this.material.uniforms.radius.value = this.options.initRadius || this.radius/10;
		// }
        this.start = requestAnimationFrame(this.animate.bind(this))
        TWEEN.update()
    }
    stop() {
        if(this.start) {
            cancelAnimationFrame(this.start)
        }
        
    }
    addTo(scene) {
        scene.add(this.mesh)
    }
}

export default SpreadCircle