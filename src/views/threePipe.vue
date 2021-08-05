<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import {getPublicData} from "@/api/requestData.js";

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

import * as TWEEN from "@tweenjs/tween.js"

import LineBezierCurve3 from '@/utils/widgets/threeLineBezierCurve3/LineBezierCurve3.js'

export default ({
    name: "ThreeMacroScene",
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
        console.log('AAAAAAAAAAAA')
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
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(0, 0, 50)

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
                // controls = new OrbitControls(this.camera, renderer.domElement)
                controls = new TrackballControls(this.camera, renderer.domElement)
            }else {
                // controls = new OrbitControls(this.camera, this.renderer.domElement)
                controls = new TrackballControls(this.camera, this.renderer.domElement)
            }
            controls.rotateSpeed = 2.0
            controls.zoomSpeed = 2.0
            controls.panSpeed = 1.0
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
            dirLight.position.set(20, 20, 25)
            //可以产生阴影
            // dirLight.castShadow = true
            // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 50
            dirLight.shadow.camera.left = -10
            dirLight.shadow.camera.right = 10
            dirLight.shadow.camera.top = 10
            dirLight.shadow.camera.bottom = -10
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示灯光范围
            const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            this.scene.add(debugCamera)
            //显示灯光方向
            var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            this.scene.add(debugCamera1)
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

            this.innerPipe.material.map.offset.x -= 0.01
            // this.texture.offset.x -= 0.01


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
        createPipe() {
            const nodeList = [
                [-20,0,-10],
                [-20,0,10],
                [0,0,10],
                [0,0,-10],
                [20,0,-10],
                [20,0,10]
            ]
            
            const curve = new LineBezierCurve3(nodeList, 0.5)
            const outerGeometry = new THREE.TubeGeometry(curve, 128, 1, 8, false)
            const outerMaterial = new THREE.MeshPhongMaterial({
                color: 0xc6c6c6,
                emissive: 0x0,
                specular: 0x666666,
                shiniess: 60,
                transparent: true,
                opacity: 0.5,
                depthWrite: true,
                depthTest: true,
                // side: THREE.DoubleSide
            })
            const outerPipe = new THREE.Mesh(outerGeometry,outerMaterial)
            outerPipe.renderOrder = 2
            this.scene.add(outerPipe)

            const innerGeometry = new THREE.TubeGeometry(curve, 152, 0.8, 8, false)
            const canvas = document.createElement('canvas')
            document.body.appendChild(canvas)
            canvas.width = 200
            canvas.height = 5
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = "#00C8FF"
            ctx.fillRect(0,0,100,40)
            ctx.fillStyle = "rgba(1,1,1,0.1)"
            ctx.fillRect(100,0,200,40)
            const texture = new THREE.CanvasTexture(canvas)
            texture.wrapT = THREE.RepeatWrapping
            texture.wrapS = THREE.RepeatWrapping
            texture.repeat.x = 10;
            const innerMaterial = new THREE.MeshPhongMaterial({
                map: texture,
                transparent: true,
                emissive: 0x0,
                specular: 0x2d2d2d,
                shiniess: 37,
                depthWrite: true,
                depthTest: true,
                // side: THREE.DoubleSide

            })
            const innerPipe = new THREE.Mesh(innerGeometry, innerMaterial)
            innerPipe.renderOrder = 1
            this.scene.add(innerPipe)
            this.innerPipe = innerPipe

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
