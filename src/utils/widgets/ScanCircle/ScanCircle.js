import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"
// var TWEEN = require('@tweenjs/tween.js')


class SpreadCircle {

    mesh
    material
    static START
    static MY_TWEEN
     /**
     * SpreadCircle构造函数
     *
     * @param {Vector3} center 扩散圆位置
     * @param {Number} radius 扩散圆半径
     * @param {Object} options 阔散圆样式
     * @param {Color} options.color 圆环颜色
     * @param {Number} options.radius 圆环初始半径
     * @param {Number} options.width 圆环半径
     * @param {Number} options.duration 单个动画持续时间
     */
    constructor(center, radius, options) {
        this.radius = radius
        this.options = options
        let material = this.createSpreadCircleMaterial(options)
        this.material = material
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        let geometry = new THREE.CircleGeometry(radius,120)
        let mesh = new THREE.Mesh(geometry,material)
        mesh.position.copy(center)
        this.mesh = mesh
        let duration = options.duration || 3000
        SpreadCircle.MY_TWEEN = new TWEEN.Tween(material.uniforms.radius) 
            .to({value:radius}, duration)
            .easing(TWEEN.Easing.Cubic.Out)
            .repeat(Infinity)
            .start()
        this.animate(material,radius,options)
    }
    get mesh() {
        return this.mesh
    }
    createSpreadCircleMaterial(options) {
        let color = options.color || new THREE.Color("rgb(255, 255, 255)")
        let annulus_radius = options.radius || this.radius/10
        let width = options.width || this.radius/10
        console.log(annulus_radius)
        
        let uniforms = {
            color: {
                value: color
            },
            radius: {
                value: annulus_radius
            },
            width: {
                value: width
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
            uniform float width;

            void main(){
                float pct=distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
                if(pct>radius || pct<(radius-width)){
                    gl_FragColor = vec4(1.0,0.0,0.0,0);
                }else{
                    float dis=(pct-(radius-width))/(radius-width);
                    gl_FragColor = vec4(color,dis);
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
        //     console.log(this.options.radius)
		// 	this.material.uniforms.radius.value = this.options.radius || this.radius/10;
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