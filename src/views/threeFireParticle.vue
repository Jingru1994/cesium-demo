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
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

import * as TWEEN from "@tweenjs/tween.js"

import ParticleSystem from '@/utils/widgets/ParticleFire/ParticleFire1/ParticleSystem.js'
import {SmokeOptions, FireOptions, SparkOptions} from '@/utils/widgets/ParticleFire/ParticleFire1/ParticleType.js'
import ParticleSystem2 from '@/utils/widgets/ParticleFire/ParticleFire2/ParticleSystem.js'

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
        this.clock = new THREE.Clock()
        this.clock.autoStart = true
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        this.loadModels()
        this.addFire()
        this.addFire2()
        this.addPlanes()

        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }

        this.animate();
    },

    beforeDestroy() {
        cancelAnimationFrame(this.myAnimate)
        window.removeEventListener('resize', this.onWindowResize)
        this.fireGroup.forEach(item => {
            console.log(item)
            item.destroy()
        })
        this.fire.destroy()
        
        this.opaqueScene.traverse(item => {
            if(item.isMesh || item instanceof THREE.Sprite){
                item.geometry.dispose()
                if(item.material instanceof Array){
                    item.material.forEach(material => {
                        material.dispose()
                    })
                }else{
                    item.material.dispose()
                }
                console.log('dispose1')
            }
        })
        this.transparentScene.traverse(item => {
            if(item.isMesh || item instanceof THREE.Sprite){
                item.geometry.dispose()
                if(item.material instanceof Array){
                    item.material.forEach(material => {
                        material.dispose()
                    })
                }else{
                    item.material.dispose()
                }
                console.log('dispose2')
            }
        })
        THREE.Cache.clear()
        this.opaqueScene.clear()
        this.transparentScene.clear()
        
        this.transparentScene = null
        this.opaqueScene = null
        this.camera = null
        this.renderer = null
    },
    methods: {
        addPlanes() {
            const canvas1 = document.createElement('canvas')
            canvas1.width = 800
            canvas1.height = 1200
            
            const ctx1 = canvas1.getContext('2d')
            ctx1.fillStyle = "rgba(0,0,0,0.5)"
            ctx1.fillRect(0,0,2000,2000)
            ctx1.fillStyle = "#ffffff"
            ctx1.font = "60px bold 微软雅黑"
            ctx1.fillText("三个粒子系统", 80,160)
            ctx1.font = "48px bold 微软雅黑"
            ctx1.fillText("◆ 可实现软粒子效果，火焰与", 80,300)
            ctx1.fillText("模型相接处无明显边界", 120,370)
            ctx1.fillText("◆ 火焰与烟雾分离，上下拖拽", 80,470)
            ctx1.fillText("鼠标可观察，火焰与烟雾整", 120,540)
            ctx1.fillText("体相互遮盖，且遮盖顺序随", 120,610)
            ctx1.fillText("距相机的距离改变而变化", 120,680)
            ctx1.fillText("◆ 软粒子与火焰、烟雾融合目", 80,830)
            ctx1.fillText("前无法做到同时实现，根据", 120,900)
            ctx1.fillText("需求选择使用哪种实现方式", 120,970)
            ctx1.fillText("更合适", 120,1040)

            const texture1 = new THREE.CanvasTexture(canvas1)
            const material1 = new THREE.SpriteMaterial( { map: texture1 } );

            const sprite1 = new THREE.Sprite( material1 );
            sprite1.center.set(0,1)
            sprite1.position.set(-230,150,300)
            sprite1.scale.set(200,300)
            this.transparentScene.add( sprite1 );

            const canvas2 = document.createElement('canvas')
            canvas2.width = 800
            canvas2.height = 1200
            
            const ctx2 = canvas2.getContext('2d')
            ctx2.fillStyle = "rgba(0,0,0,0.5)"
            ctx2.fillRect(0,0,2000,2000)
            ctx2.fillStyle = "#ffffff"
            ctx2.font = "60px bold 微软雅黑"
            ctx2.fillText("一个粒子系统", 80,160)
            ctx2.font = "48px bold 微软雅黑"
            ctx2.fillText("◆ 不能实现软粒子效果，火焰", 80,300)
            ctx2.fillText("与模型相接处有明显边界", 120,370)
            ctx2.fillText("◆ 火焰与烟雾融合，每个粒子", 80,470)
            ctx2.fillText("根据距相机距离绘制，不区", 120,540)
            ctx2.fillText("分是火焰还是烟雾", 120,610)
            ctx2.fillText("◆ 软粒子与火焰、烟雾融合目", 80,830)
            ctx2.fillText("前无法做到同时实现，根据", 120,900)
            ctx2.fillText("需求选择使用哪种实现方式", 120,970)
            ctx2.fillText("更合适", 120,1040)

            const texture2 = new THREE.CanvasTexture(canvas2)
            const material2 = new THREE.SpriteMaterial( { map: texture2 } );

            const sprite2 = new THREE.Sprite( material2 );
            sprite2.center.set(0,1)
            sprite2.position.set(250,150,300)
            sprite2.scale.set(200,300)
            this.transparentScene.add( sprite2 );
        },
        addFire2() {
            const params = {
                camera: this.camera,
                parent: this.transparentScene
            }
            const fire = new ParticleSystem2(params)
            fire.points.position.set(150, -300, 300)
            // fire.points.scale.set(10,10,10)
            fire.setScale(10)
            this.transparentScene.add(fire.points)
            fire.update()
            this.fire = fire
            
        },
        addFire() {
            const depthTexture = new THREE.DepthTexture();
            depthTexture.type = THREE.UnsignedShortType
            depthTexture.minFilter = THREE.NearestFilter
            depthTexture.maxFilter = THREE.NearestFilter
            this.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE.NearestFilter,
                maxFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                depthTexture: depthTexture,
                depthBuffer: true
            })

            const fireParams = {
                camera: this.camera,
                depthTexture: this.target.depthTexture,
                options: FireOptions
            }
            const sparkParams = {
                camera: this.camera,
                depthTexture: this.target.depthTexture,
                options: SparkOptions
            }
            const smokeParams = {
                camera: this.camera,
                depthTexture: this.target.depthTexture,
                options: SmokeOptions
            }

            const fire = new ParticleSystem(fireParams)
            fire.setScale(10)
            fire.update()
            fire.points.position.set(0,-300,0)
            
            const spark = new ParticleSystem(sparkParams)
            spark.setScale(10)
            spark.update()
            spark.points.position.set(0,-170,0)
            
            const smoke = new ParticleSystem(smokeParams)
            smoke.setScale(10)
            smoke.update()
            smoke.points.position.set(0,-170,0)

            const group = new THREE.Group()
            group.add(fire.points, spark.points, smoke.points)
            group.position.set(-350,0,300)
            this.transparentScene.add(group)

            this.fireGroup = [fire,spark,smoke]
        },
        addClickListener() {
            this.renderer.domElement.addEventListener('click',e => {
                console.log(this.camera)
                console.log(this.controls)
            })
        },
        initScene() {
            // const scene = new THREE.Scene()
            // this.scene = scene
            const opaqueScene = new THREE.Scene()
            this.opaqueScene = opaqueScene
            const transparentScene = new THREE.Scene()
            this.transparentScene = transparentScene

            this.opaqueScene.background = new THREE.Color(0x333333)
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
            // this.scene.add(ambientLight)
            this.opaqueScene.add(ambientLight)
        },
        initDirectionalLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
            //光源位置
            dirLight.position.set(3000, 2000, 2500)
            // this.scene.add(dirLight)
            this.opaqueScene.add(dirLight)
            dirLight.shadow.camera.near = 100
            dirLight.shadow.camera.far = 5000
            dirLight.shadow.camera.left = -500
            dirLight.shadow.camera.right = 500
            dirLight.shadow.camera.top = 500
            dirLight.shadow.camera.bottom = -500
            //显示灯光方向
            // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            // this.opaqueScene.add(debugCamera1)
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
        
            let delta = this.clock.getDelta()
            this.renderer.clear()

            this.renderer.setRenderTarget(this.target)
            this.renderer.render(this.opaqueScene, this.camera)
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.opaqueScene, this.camera)
            this.renderer.autoClear = false
            this.renderer.render(this.transparentScene,this.camera)
            
            // this.renderer.render(this.scene,this.camera)
            
            this.controls.update(delta)//TrackballControls

            TWEEN.update()
            
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

            // this.scene.add(model)
            this.opaqueScene.add(model)

            this.factory = model
        },
        loadGLTFModel(url) {  
            const p = new Promise((resolve,reject) => {
                const gltfLoader = new GLTFLoader()
                gltfLoader.load(
                    url,
                    (gltf) => {
                        const model = gltf.scene || gltf.scene[0]

                        if (!gltf.scene) {
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
            this.controls.mimDistance = 10
            this.controls.maxDistance = size * 10;
            this.camera.near = size / 100;
            this.camera.far = size * 100;
            this.camera.updateProjectionMatrix();

            this.camera.position.set(1.0597310110771188, 208.92874400450108, 1095.6604754734267)
            
            this.camera.lookAt(center);
            this.controls.saveState();

            // this.scene.add(object);
            this.content = object

            console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');
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
