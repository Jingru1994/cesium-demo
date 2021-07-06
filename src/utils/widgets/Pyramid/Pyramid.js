import * as THREE from "three"

class Pyramid {

    mesh
    material
    start
     /**
     * Pyramid构造函数
     *
     * @param {Object} options 底部元素样式
     * @param {Color} options.color 颜色
     * @param {Number} options.scale 缩放
     * @param {Vector3} options.position 位置
     * @param {Number} options.speed 速度
     */
    constructor(options) {
        let color = options && options.color || 0xff3333
        let scale = options && options.scale || 1
        let position = options && options.position || new THREE.Vector3(0,0,0)
        let speed = options && options.speed || 0.01
        this.speed = speed

        let mesh = new THREE.Group()

        const vertices = [
            -1,1,2,
            1,1,2,
            1,-1,2,
            -1,-1,2,
            0,0,0
        ]
        const vertices1 = [
            -0.4,0.4,0.8,
            0.4,0.4,0.8,
            0.4,-0.4,0.8,
            -0.4,-0.4,0.8,
            0,0,0
        ]
        const faces = [
            0,3,1,
            1,3,2,
            1,2,4,
            2,3,4,
            3,0,4,
            0,1,4
        ]
        
        const pyramidGeometry = new THREE.PolyhedronGeometry( vertices, faces, 1 );
        const pyramidMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4
        })
        
        const pyramid = new THREE.Mesh(pyramidGeometry,pyramidMaterial)

        const edges = new THREE.EdgesGeometry(pyramidGeometry,1)
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: color
        })
        const line = new THREE.LineSegments(edges,edgesMaterial)

        mesh.add(pyramid,line)
        for(let i = 0; i < vertices1.length/3; i++) {
            const sphereGeometry = new THREE.SphereGeometry(0.1,32,32)
            const sphereMaterial = new THREE.MeshBasicMaterial({color: color})
            const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial)
            sphere.position.set(vertices1[3*i],vertices1[3*i+1],vertices1[3*i+2])
            mesh.add(sphere)
        }

        mesh.scale.set(scale,scale,scale)
        mesh.position.copy(position)
        this.mesh = mesh
        this.animate()
    }
    get mesh() {
        return this.mesh
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

export default Pyramid