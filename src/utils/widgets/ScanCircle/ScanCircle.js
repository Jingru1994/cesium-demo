import * as THREE from "three"
import * as TWEEN from "@tweenjs/tween.js"
// var TWEEN = require('@tweenjs/tween.js')


class ScanCircle {

    mesh
    material
    static START
    static MY_TWEEN
     /**
     * ScanCircle构造函数
     *
     * @param {Vector3} center 扫描圆位置
     * @param {Number} radius 扫描半径
     * @param {Object} options 扫描圆样式
     * @param {Color} options.color 颜色
     * @param {Number} options.duration 单个动画持续时间
     */
    constructor(center, radius, options) {
        this.radius = radius
        this.options = options
        let material = this.createScanCircleMaterial(radius,options)
        this.material = material
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        let geometry = new THREE.CircleGeometry(radius,120)
        let mesh = new THREE.Mesh(geometry,material)
        mesh.position.copy(center)
        this.mesh = mesh
        let duration = options.duration || 3000
        ScanCircle.MY_TWEEN = new TWEEN.Tween(material.uniforms.theta) 
            .to({value:360.0}, duration)
            .repeat(Infinity)
            .start()
        this.animate(material,radius,options)
    }
    get mesh() {
        return this.mesh
    }
    createScanCircleMaterial(radius, options) {
        let color = options.color || new THREE.Color("rgb(255, 255, 255)")
        
        let uniforms = {
            color: {
                value: color
            },
            radius: {
                value: radius
            },
            theta: {
                value: 0.0
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
            #define M_PI 3.1415926535897932384626433832795

            varying vec3 vPosition;
            uniform vec3 color;
            uniform float radius;
            uniform float theta;

            float movingLine(vec2 position, vec2 center, float radius)
            {
                //angle of the line
                float theta0 = theta;
                vec2 d = position - center;
                float r = sqrt( dot( d, d ) );
                if(r<20.0)
                {
                    //compute the distance to the line theta=theta0
                    vec2 p = radius*vec2(cos(theta0*M_PI/180.0), -sin(theta0*M_PI/180.0));
                    float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
                    d = normalize(d);
                    //compute gradient based on angle difference to theta0
                    float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
                    float gradient = clamp(1.0-theta/90.0,0.0,1.0);
                    return 0.5*gradient;
                }
                else return 0.0;
            }
            void main()
            {
                float opacity;
                vec2 center = vec2(0.0, 0.0);
                opacity = movingLine(vPosition.xy, center, radius);
                gl_FragColor = vec4( color, opacity );
                
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
        this.start = requestAnimationFrame(this.animate.bind(this))
        TWEEN.update()
        // this.material.uniforms.iTime.value += 0.01
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

export default ScanCircle