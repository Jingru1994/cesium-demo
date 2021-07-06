import * as THREE from "three"

class SemiRing {

    mesh
    material
    start
     /**
     * SemiRing构造函数
     *
     * @param {Object} options 底部元素样式
     * @param {Color} options.color1 左颜色
     * @param {Color} options.color1 中颜色
     * @param {Color} options.color1 右颜色
     * @param {Number} options.splitPoint 颜色分割点，值域(0,1)
     * @param {Number} options.scale 缩放
     * @param {Vector3} options.position 位置
     * @param {Vector3} options.speed 速度
     */
    constructor(options) {
        
        const scale = options && options.scale || 2.0
        const position = options && options.position || new THREE.Vector3(0,0,0)
        const speed = options && options.speed || 0.01
        this.speed = speed

        const geometry = this.createGeometry()
        const material = this.createMaterial(options)

        const mesh = new THREE.Mesh(geometry, material)
        this.reMapUv(mesh.geometry)

        mesh.scale.set(scale,scale,scale)
        mesh.position.copy(position)
        this.mesh = mesh
        this.animate()
    }
    get mesh() {
        return this.mesh
    }
    createGeometry() {
        const shape = new THREE.Shape()
        shape.moveTo(-17,0)
        shape.arc(0, 0, 1, 2*Math.PI, Math.PI, true)
        // shape.arc(18, 0, 18, Math.PI, 0,true)//arc的segment太少，曲线不平滑
        const curve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
            18, 18,           // xRadius, yRadius
            Math.PI, 2 * Math.PI,  // aStartAngle, aEndAngle
            true              // aClockwise
        )
        const points = curve.getPoints( 64 )
        points.forEach(function(item) {
            shape.lineTo(item.x,item.y)
        })

        shape.arc(-1, 0, 1, 2*Math.PI, Math.PI, true)
        // shape.arc(-16, 0, 16, 0, Math.PI)
        const curve1 = new THREE.EllipseCurve(
            0,  0,
            16, 16,
            0, Math.PI,
            false
        )
        const points1 = curve1.getPoints( 64 )
        points1.forEach(function(item) {
            shape.lineTo(item.x,item.y)
        })

        const shapeGeometry = new THREE.ShapeGeometry(shape)
        return shapeGeometry
    }
    createMaterial(options) {
        const color1 = options && options.color1 || new THREE.Color("#737373")
        const color2 = options && options.color2 || new THREE.Color("#000000")
        const color3 = options && options.color3 || new THREE.Color("#19066B")
        const splitPoint = options && options.splitPoint || 0.5
        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                color1: {
                    value: color1
                },
                color2: {
                    value: color2
                },
                color3: {
                    value: color3
                },
                splitPoint: {
                    value: splitPoint
                }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                uniform float splitPoint;
            
                varying vec2 vUv;
                
                void main() {
                    vec3 color = vUv.x < splitPoint ? mix(color1, color2, vUv.x/splitPoint) : mix(color2, color3, (vUv.x-splitPoint)/(1.0-splitPoint));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            // wireframe: true
        })
        return material
    }
    reMapUv(geometry) {
        geometry.computeBoundingBox()
        const max = geometry.boundingBox.max
        const min = geometry.boundingBox.min
        const offset = new THREE.Vector2(0 - min.x, 0 - min.y)
        const range = new THREE.Vector2(max.x - min.x, max.y - min.y)
        const uvArray = geometry.getAttribute('uv')
        for(let i = 0; i < uvArray.array.length; i++){
            uvArray.array[i] = i % 2 ? (uvArray.array[i]+ offset.y) / range.y  : (uvArray.array[i] + offset.x) / range.x
        }
        geometry.setAttribute('uv', uvArray)
    }
    scale(x,y,z) {
        this.mesh.scale.set(x,y,z)
    }
    animate() {
        this.mesh.rotation.z += this.speed
        this.start = requestAnimationFrame(this.animate.bind(this))
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

export default SemiRing