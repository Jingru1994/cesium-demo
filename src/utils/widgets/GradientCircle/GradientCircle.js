import * as THREE from "three"


class GradieCircle {

    mesh
     /**
     * GradieCircle构造函数
     *
     * @param {Object} options 渐变圆样式
     * @param {Vector3} options.center 渐变圆位置
     * @param {Number} options.radius 渐变圆半径
     * @param {Color} options.color 圆环颜色
     */
    constructor(options) {
        let radius = options && options.radius || 20
        this.radius = radius
        let material = this.createGradieCircleMaterial(options)
        // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        let geometry = new THREE.CircleGeometry(radius,120)
        let mesh = new THREE.Mesh(geometry,material)
        let position = options && options.center || new THREE.Vector3(0,0,0)
        mesh.position.copy(position)
        this.mesh = mesh
    }
    get mesh() {
        return this.mesh
    }
    createGradieCircleMaterial(options) {
        let color = options && options.color || new THREE.Color("rgb(255, 255, 255)")
        let radius = options && options.radius || 20
        
        let uniforms = {
            color: {
                value: color
            },
            radius: {
                value: radius
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

            void main(){
                // float dis = distance(vec2(vPosition.x,vPosition.y),vec2(0.0));
                // float alpha = smoothstep(0.0,radius,dis;

                // float pct = distance(vec2(vPosition.x,vPosition.y),vec2(0.0))/radius;
                // float sq = pct * pct;
                // float alpha = sq * 0.8;

                float pct = distance(vec2(vPosition.x,vPosition.y),vec2(0.0))/radius;
                float alpha = pct * 0.7;
                gl_FragColor = vec4(color,alpha);
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
    addTo(scene) {
        scene.add(this.mesh)
    }
}

export default GradieCircle