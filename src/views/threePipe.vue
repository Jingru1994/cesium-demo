<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import * as TWEEN from "@tweenjs/tween.js"

import LineBezierCurve3 from '@/utils/widgets/threeLineBezierCurve3/LineBezierCurve3Copy.js'

export default ({
    name: "ThreePipe",
    data() {
        return {
        }
    },
    created() {
    },
    async mounted() {
        this.interval = 0
        this.depth = 0.5 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        this.createPipe()
        this.createCylinder()
        
        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        this.animate()
        
    },
    beforeDestroy() {
        cancelAnimationFrame(this.myAnimate)
        this.scene.traverse(item => {
            if(item.isMesh || item instanceof THREE.Sprite){
                item.geometry.dispose()
                if(item.material instanceof Array){
                    item.material.forEach(material => {
                        material.dispose()
                    })
                }else{
                    item.material.dispose()
                }
            }
        })
        THREE.Cache.clear()
        this.scene.clear()
        this.scene = null
        this.camera = null
        this.renderer = null
    },
    methods: {
        addClickListener() {
            this.renderer.domElement.addEventListener('click',e => {
                console.log(this.camera)
                console.log(this.controls)
            })
        },
        initScene() {
            const scene = new THREE.Scene()
            this.scene = scene
            scene.background = new THREE.Color(0x333333)
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            // renderer.sortObject = false
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(-20, 40, 60)

            // 避免模型很模糊的现象
            let width = window.innerWidth
            let height = window.innerHeight
            let canvasPixelWidth = canvas.width / window.devicePixelRatio
            let canvasPixelHeight = canvas.height / window.devicePixelRatio
            const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
            if (needResize) {
                this.renderer.setSize(width, height, false)
            }
            window.addEventListener( 'resize', this.onWindowResize )

            const planeGeometry = new THREE.PlaneGeometry(200,200)
            const planeMaterial = new THREE.MeshLambertMaterial({
                color: 0x505864,
                emissive: 0x0,
                side: THREE.DoubleSide
            })
            const plane = new THREE.Mesh(planeGeometry, planeMaterial)
            plane.receiveShadow = true
            plane.rotation.x = Math.PI/2
            plane.position.y = -3.1
            this.scene.add(plane)

        },
        addState(){
            let state = new Stats()
            this.state = state
            const container = document.querySelector('.three-view')
            container.appendChild(state.dom)
        },
        initControls(renderer) {
            let controls
            if(renderer) {
                controls = new OrbitControls(this.camera, renderer.domElement)
            }else {
                controls = new OrbitControls(this.camera, this.renderer.domElement)
            }
            this.controls = controls
        },
        initLight() {
            this.initAmbientLight()
            // this.initPointLight()
            this.initDirectionalLight()
        },
        initAmbientLight() {
            //环境光
            const ambientLight = new THREE.AmbientLight("#ffffff");
            this.scene.add(ambientLight)
        },
        initDirectionalLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight('#fff', 0.2)
            //光源位置
            dirLight.position.set(20, 40, 15)
            //可以产生阴影
            dirLight.castShadow = true
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 500
            dirLight.shadow.camera.left = -400
            dirLight.shadow.camera.right = 400
            dirLight.shadow.camera.top = 400
            dirLight.shadow.camera.bottom = -400
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示灯光方向
            // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            // this.scene.add(debugCamera1)
        },
        initPointLight() {
            const pointLight = new THREE.PointLight( 0xffffff, 0.5, 200 );
            pointLight.position.set( 50, 50, 0 );
            this.scene.add(pointLight)
            // 显示阴影
            // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
            // this.scene.add(debugCamera)
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
            this.renderer.render(this.scene,this.camera)
            
            this.controls.update(this.clock.getDelta())//TrackballControls
            
            this.texture.offset.x -= 0.005

            TWEEN.update()
            
            this.state.update();
            this.myAnimate = requestAnimationFrame(this.animate);
        },
        onWindowResize() {
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        createCylinder() {
            const group = new THREE.Group()
            const innerGeometry1 = new THREE.CylinderGeometry(4,4,20,32)
            const innerMaterial = new THREE.MeshPhongMaterial({color: 0x049EF4})
            const innerCylinder1 = new THREE.Mesh(innerGeometry1, innerMaterial)
            const innerGeometry2 = new THREE.CylinderGeometry(4,4,10,32)
            const innerCylinder2 = new THREE.Mesh(innerGeometry2, innerMaterial)
            
            const outGeometry = new THREE.CylinderGeometry(5,5,24,32)
            const outMaterial = new THREE.MeshPhongMaterial({color: 0xc6c6c6, transparent: true, opacity: 0.3})
            const outMaterial1 = new THREE.MeshPhongMaterial({color: 0xc6c6c6, transparent: true, opacity: 0.3, side: THREE.BackSide})
            const outCylinder1 = new THREE.Mesh(outGeometry, outMaterial)
            const outCylinder1_1 = new THREE.Mesh(outGeometry, outMaterial1)
            const outCylinder2 = new THREE.Mesh(outGeometry, outMaterial)
            const outCylinder2_1 = new THREE.Mesh(outGeometry, outMaterial1)
            
            const boxGeometry = new THREE.BoxGeometry(4,3,4)
            const boxMaterial = new THREE.MeshPhongMaterial({color: 0xA0A9B8})
            const box1 = new THREE.Mesh(boxGeometry, boxMaterial)
            const box2 = new THREE.Mesh(boxGeometry, boxMaterial)

            const rectangleGeometry = new THREE.BoxGeometry(12,2,3.6)
            const rectangle = new THREE.Mesh(rectangleGeometry, boxMaterial)

            innerCylinder1.position.set(-8,-1.9,0)
            innerCylinder2.position.set(8,-6.9,0)
            outCylinder1.position.set(-8,0,0)
            outCylinder1_1.position.set(-8,0,0)
            outCylinder2.position.set(8,0,0)
            outCylinder2_1.position.set(8,0,0)
            box1.position.set(-8,13.5,0)
            box2.position.set(8,13.5,0)
            rectangle.position.set(0,13.3,0)
            group.add(innerCylinder1,innerCylinder2,outCylinder1,outCylinder2,box1,box2,rectangle)
            // group.add(innerCylinder1,innerCylinder2,outCylinder1,outCylinder1_1,outCylinder2,outCylinder2_1,box1,box2,rectangle)
            // group.add(innerCylinder1,innerCylinder2,outCylinder1_1,outCylinder1,outCylinder2_1,outCylinder2,box1,box2,rectangle)
            
            group.traverse((o)=>{
                if (o.isMesh) {
                    o.castShadow = true
                }
            })
            group.position.set(20,9,-20)
            this.scene.add(group)
            const cubeGeometry = new THREE.BoxGeometry(6,6,6)
            const cube = new THREE.Mesh(cubeGeometry, boxMaterial)
            cube.castShadow = true
            cube.position.set(-30,0,10)
            this.scene.add(cube)

            const scales1 = [1, 1.1, 0.3, 0.8, 0.1, 1]
            this.cylinderAnimate(innerCylinder1, scales1, -12)
            const scales2 = [1, 0.1, 1.5, 1.2, 0.5, 1]
            this.cylinderAnimate(innerCylinder2, scales2, -12)
        },
        cylinderAnimate(cylinder, scales, offset) {
            const tweenList = []
            for(let i = 0; i < scales.length-1; i++){
                let tween
                tween = new TWEEN.Tween({scale: scales[i]})
                    .to({scale: scales[i+1]}, 3000)
                    .easing(TWEEN.Easing.Quartic.InOut)
                    .onUpdate(({scale}) => {
                        cylinder.scale.set(1,scale,1)
                        cylinder.position.y = cylinder.geometry.parameters.height/2*scale+offset
                    })
                tweenList.push(tween)
            }
            tweenList[0].start()
            for(let i = 0; i < tweenList.length; i++){
                if(i === tweenList.length-1){
                    tweenList[i].chain(tweenList[0])
                }else{
                    tweenList[i].chain(tweenList[i+1])
                }
            }
        },
        createPipe() {
            const nodeList = [
                [-30,0,10],
                [-20,0,10],
                [-20,0,-10],
                [20,0,-10],
                [20,22.3,-10],
                [20,22.3,-18.2]
            ]
            const curve = new LineBezierCurve3(nodeList, 5)
            const canvas = document.createElement('canvas')
            canvas.width = 200
            canvas.height = 5
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = "#049EF4"
            ctx.fillRect(0,0,100,40)
            // ctx.fillStyle = "rgba(255,255,255,0.1)"
            // ctx.fillRect(100,0,200,40)
            const texture = new THREE.CanvasTexture(canvas)
            texture.wrapT = THREE.RepeatWrapping
            texture.wrapS = THREE.RepeatWrapping
            texture.repeat.x = 10;
            this.texture = texture

            const innerGeometry = new THREE.TubeGeometry(curve, 152, 0.8, 8, false)
            const innerMaterial1 = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                emissive: 0x0,
                specular: 0x2d2d2d,
                shininess: 60,
                depthWrite: true,
                depthTest: true,
                side: THREE.BackSide

            })
            const innerMaterial2 = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                emissive: 0x0,
                specular: 0x2d2d2d,
                shininess: 60,
                depthWrite: true,
                depthTest: true,
                side: THREE.FrontSide

            })
            const innerPipe1 = new THREE.Mesh(innerGeometry, innerMaterial1)
            // this.scene.add(innerPipe1)
            const innerPipe2 = new THREE.Mesh(innerGeometry, innerMaterial2)
            // this.scene.add(innerPipe2)

            const outerGeometry = new THREE.TubeGeometry(curve, 128, 1, 8, false)
            const outerMaterial1 = new THREE.MeshPhongMaterial({
                color: 0xB3B6C9,
                emissive: 0x0,
                specular: 0x666666,
                shininess: 60,
                transparent: true,
                opacity: 0.4,
                depthWrite: false,
                depthTest: true,
                side: THREE.BackSide
            })
            const outerMaterial2 = new THREE.MeshPhongMaterial({
                color: 0xB3B6C9,
                emissive: 0x0,
                specular: 0x666666,
                shininess: 60,
                transparent: true,
                opacity: 0.4,
                depthWrite: false,
                depthTest: true,
                side: THREE.FrontSide
            })
            const outerPipe1 = new THREE.Mesh(outerGeometry,outerMaterial1)
            // this.scene.add(outerPipe1)
            outerPipe1.castShadow = true
            const outerPipe2 = new THREE.Mesh(outerGeometry,outerMaterial2)
            // this.scene.add(outerPipe2)

            outerPipe2.castShadow = true

            this.scene.add(innerPipe1)
            this.scene.add(innerPipe2)
            // this.scene.add(outerPipe1)
            this.scene.add(outerPipe2)
        }
    }
})
</script>

<style lang="scss">
#app {
    overflow: hidden;
}
.three-view {
    #three {
        width: 100%;
        height: 100%;
    }

}

</style>
