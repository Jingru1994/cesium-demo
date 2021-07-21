<template>
    <div class="three-view">
        <canvas id="three"></canvas>
        <div class="operation-panel">
            <el-button @click="animationAgain" :disabled="!isClick">再次巡检</el-button>
        </div>
    </div>
</template>
<script>
import {getPublicData} from "@/api/requestData.js";

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

import * as TWEEN from "@tweenjs/tween.js"

import LineBezierCurve3 from '@/utils/widgets/threeLineBezierCurve3/LineBezierCurve3.js'
import GPUParticleSystem from '@/utils/widgets/ParticleFire/GPUParticleSystem/ParticleFire.js'
import VolumetricFire from '@/utils/widgets/ParticleFire/VolumetricFire/VolumetricFire.js'
import FlameEmitter from '@/utils/widgets/ParticleFire/FlameEmitter/libs/emitters/flame.js'
// import ParticleSystem from '@/utils/widgets/ParticleFire/FlameEmitter/libs/system'
import ParticleSystem from '@/utils/widgets/ParticleFire/my/ParticleSystem.js'

// const h337 = require("heatmap.js")

export default ({
    name: "ThreeMacroScene",
    data() {
        return {
            isClick: false
        }
    },
    created() {
    },
    async mounted() {
        this._previousAnimate = null
        this.prevTime = 0;
        this.interval = 0
        this.depth = 0.5 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        this.clock.autoStart = true
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        // this.loadModels()
        // this.pickObject()

        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        
        // fire1
        // const fire = new FlameEmitter()
        // console.log(fire)

        // const textureLoader = new THREE.TextureLoader()
        // const options = {
        //     maxParticles: 1000,
        //     position: new THREE.Vector3(0,0,0),
        //     positionRandomness: 0.0,
        //     baseVelocity: new THREE.Vector3(0.0, 1.0, 0.0),
        //     velocity: new THREE.Vector3(0.0, 1.0, 0.0),
        //     velocityRandomness: 0.3,
        //     acceleration: new THREE.Vector3(0.0,0.0,0.0),
        //     color: new THREE.Color(0.5,0.3,0.0),
        //     endColor: new THREE.Color(0.5,0.0,0.0),
        //     colorRandomness: 0.5,
        //     lifetime: 3.0,
        //     size: 500,
        //     sizeRandomness: 1.0,
        //     particleSpriteTex: textureLoader.load('images/particle2.png'),
        //     blending: THREE.AdditiveBlending,
        //     onTick:(system,time) => {
        //         options.velocity.x = options.baseVelocity.x + system.random() * options.velocityRandomness
        //         options.velocity.y = options.baseVelocity.y + system.random() * options.velocityRandomness*2.0
        //         options.velocity.z = options.baseVelocity.z + system.random() * options.velocityRandomness
        //         system.spawnParticle( options );
        //     }
        // }

        // fire2
        // const fire = new GPUParticleSystem(options)
        // this.scene.add(fire)
        // this.fire = fire

        // var fireWidth  = 60;
        // var fireHeight = 120;
        // var fireDepth  = 60;
        // var sliceSpacing = 0.5;

        // var fire = new VolumetricFire(
        //     fireWidth,
        //     fireHeight,
        //     fireDepth,
        //     sliceSpacing,
        //     this.camera
        // );
        // this.scene.add( fire.mesh );
        // console.log(fire.mesh)

        // fire.mesh.position.set(0,200,0)
        // this.fire = fire

        //fire3
        // this.ps = new ParticleSystem({
        //     emitter: new FlameEmitter()
        // })
        // this.scene.add(this.ps.mesh)
        // this.ps.start()
        const params = {
            camera: this.camera,
            parent: this.scene
        }
        
        const fire = new ParticleSystem(params)
        this.fire = fire

        

        this.controls.addEventListener('change',()=>{
            
        })



        this.animate()
    },

    beforeDestroy() {
        cancelAnimationFrame(this.myAnimate)
        this.renderer = null
        this.scene = null
        this.camera = null
    },
    methods: {
        animationAgain() {
            this.isClick = false
            this.tween.start()
        },
        inspectionAnimation() {
            const curve = this.createPath()
            this.pathAnimation(curve)
        },
        createPath() {
            let nodeList = [
                [-1600,-80,-2500],
                [-1600,-80,1100],
                [2700,-80,1100],
                [2700,-80,-1500]
            ]
            let curve = new LineBezierCurve3(nodeList)
            return curve
        },
        pathAnimation(curve) {
            const that = this
            const tween = new TWEEN.Tween({ t: 0 })
                .to({ t: 0.99 }, 40000)
                .onUpdate(({ t }) => {
                    that.camera.position.copy(curve.getPoint(t))
                    that.controls.target.copy(curve.getPoint(t))
                    // object.position.copy(curve.getPoint(t)) // 每帧更新位置
                    if(t !== 1) {
                        that.camera.lookAt(curve.getPoint(t+0.01))
                        that.controls.target.copy(curve.getPoint(t+0.01))
                    }
                })
                .onComplete(()=>{
                    that.controls.target.set(0,0,0)
                    that.camera.position.set(5174,3205,8210)
                    that.isClick = true
                })
                .start()
            this.tween = tween
        },
        addClickListener() {
            this.renderer.domElement.addEventListener('click',e => {
                console.log(this.camera)
                console.log(this.controls)
            })
        },
        initScene() {
            const scene = new THREE.Scene()
            this.scene = scene

            const loader = new THREE.CubeTextureLoader();
            const texture = loader.load([
                './images/posx.jpg',
                './images/negx.jpg',
                './images/posy.jpg',
                './images/negy.jpg',
                './images/posz.jpg',
                './images/negz.jpg',
            ]);
            this.scene.background = texture;

            // scene.background = new THREE.Color(0x000000)
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(0, 0, 100)

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
                controls = new OrbitControls(this.camera, renderer.domElement)
            }else {
                controls = new OrbitControls(this.camera, this.renderer.domElement)
            }
            controls.enableDamping = true
            this.controls = controls
        },
        initLight() {
            this.initAmbientLight()
            this.initDirectionalLight()
        },
        initAmbientLight() {
            //环境光
            const ambientLight = new THREE.AmbientLight("#ffffff",0.5);
            this.scene.add(ambientLight)
        },
        initDirectionalLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
            //光源位置
            dirLight.position.set(3000, 2000, 2500)
            this.scene.add(dirLight)
            dirLight.shadow.camera.near = 100
            dirLight.shadow.camera.far = 3000
            dirLight.shadow.camera.left = -500
            dirLight.shadow.camera.right = 500
            dirLight.shadow.camera.top = 500
            dirLight.shadow.camera.bottom = -500
            //显示灯光方向
            var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            this.scene.add(debugCamera1)
        },
        step(timeElapsed) {
            const timeElapseds = timeElapsed * 0.001
            this.fire.Step(timeElapseds)

        },
        animate(time) {//three需要动画循环函数，每一帧都执行这个函数
        
            let delta = this.clock.getDelta()

            this.renderer.render(this.scene,this.camera)
            
            this.controls.update(delta)//TrackballControls

            TWEEN.update()
            this.mixer && this.mixer.update(delta)
            

            // if(this.fire) {
            //     this.fire._AddParticles()

            //     var elapsed = this.clock.getElapsedTime()
            //     this.fire._UpdateParticles(elapsed)
            //     this.fire._UpadteGeometry()
                
            // }
            if(this._previousAnimate === null) {
                this._previousAnimate = time
            }
            this.step(time - this._previousAnimate)
            this._previousAnimate = time
            
            //fire2
            // var elapsed = this.clock.getElapsedTime();
            // this.fire.update( elapsed );

            //fire1
            // this.fire.update(time)
            
            this.state.update()
            this.myAnimate = requestAnimationFrame(this.animate)
        },
        onWindowResize() {
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        async getData(url) {
            let data = await getPublicData(url)
            return data.features;
        },
        async loadModels() {
            // this.loadFBXModel()
            const model = await this.loadGLTFModel('model/indorama/scene.gltf')
            model.scale.set(0.1,0.1,0.1)
            this.setContent(model)
            model.visible = true
            this.scene.add(model)

            this.factory = model
        },
        loadGLTFModel(url) {  
            const p = new Promise((resolve,reject) => {
                const gltfLoader = new GLTFLoader()
                gltfLoader.load(
                    url,
                    (gltf) => {
                        const model = gltf.scene || gltf.scene[0]

                        if (!this.scene) {
                            // Valid, but not supported by this viewer.
                            throw new Error(
                            'This model contains no scene, and cannot be viewed here. However,'
                            + ' it may contain individual 3D resources.'
                            );
                        }

                        model.traverse(function(o){
                            if(o.isMesh) {
                                let material = o.material.clone()
                                o.material = material
                            }
                        })

                        resolve(model)
                    },
                    ( xhr ) => {
                        // called while loading is progressing
                        console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` )
                        this.loadPercentage = Number((xhr.loaded / xhr.total * 100).toFixed(0))
                    },
                    ( error ) => {
                        // called when loading has errors
                        console.error( 'An error happened', error )
                    },
                )
            })
            return p
        },
        setContent ( object ) {
            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            object.position.x += (object.position.x - center.x);
            object.position.y += (object.position.y - center.y);
            object.position.z += (object.position.z - center.z);
            this.controls.maxDistance = size * 10;
            this.camera.near = size / 100;
            this.camera.far = size * 100;
            this.camera.updateProjectionMatrix();

            this.camera.position.copy(center);
            this.camera.position.x += size / 3.0;
            this.camera.position.y += size / 7.5;
            this.camera.position.z += size / 1.5;
            this.camera.lookAt(center);
            this.controls.saveState();

            // this.scene.add(object);
            this.content = object

            console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');

        },
        pickObject() {
            const that = this
            const raycaster = new THREE.Raycaster()
            let selectedObject
            this.renderer.domElement.addEventListener('mousemove',onPointerMove)
            // this.renderer.domElement.addEventListener('click',onPointerClick)
            const selectObjects = ['Object_124', 'Object_148']
            function onPointerMove(event) {
                let mouse = new THREE.Vector2();
                if ( event.isPrimary === false ) return;
                mouse.x = (event.clientX/window.innerWidth)*2 - 1
                mouse.y = -(event.clientY/window.innerHeight)*2 + 1
                
                raycaster.setFromCamera(mouse,that.camera)
                const intersects = raycaster.intersectObject(that.factory,true)
                // const intersects = raycaster.intersectObject()
                
                if(intersects.length > 0) {
                    if(selectedObject && selectedObject !== intersects[0].object) {
                        selectedObject.material.color.set(selectedObject.currentColor)
                        console.log(selectedObject)
                    }
                    if(!selectedObject || selectedObject !== intersects[0].object) {
                        selectedObject = intersects[0].object
                        selectedObject.currentColor = selectedObject.material.color.getStyle()
                        selectedObject.material.color.set("#ff5e61")
                    }
                }else {
                    if(selectedObject) {
                        selectedObject.material.color.set(selectedObject.currentColor)
                    }
                    
                    selectedObject = null
                }
            }
        },
        
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
    .operation-panel{
        position: fixed;
        top: 20px;
        left:100px;
        padding: 10px 20px;
        background-color: #ffffff;
        border-radius: 4px;
        z-index: 1;
    }

}

</style>
