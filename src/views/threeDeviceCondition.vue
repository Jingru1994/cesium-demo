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

import HeatMap from "@/utils/widgets/ThreeHeatmap/3DHeatmap.js"
import Popup from '@/utils/widgets/Popup1/Popup.js'
// const h337 = require("heatmap.js")

export default ({
    name: "ThreeDeviceCondition",
    data() {
        return {
        }
    },
    created() {
    },
    async mounted() {
        this.prevTime = 0;
        this.interval = 0
        this.depth = 0.5 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        this.clock.autoStart = true
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        this.loadModels()

        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        
        this.animate()
    },
    beforeDestroy() {
        cancelAnimationFrame(this.myAnimate)
        window.removeEventListener('resize', this.onWindowResize)
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
            scene.background = new THREE.Color(0xeeeeee)
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(0, 0, 500)

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
                // controls = new TrackballControls(this.camera, renderer.domElement)
            }else {
                controls = new OrbitControls(this.camera, this.renderer.domElement)
                // controls = new TrackballControls(this.camera, this.renderer.domElement)
            }
            controls.enableDamping = true
            // controls.rotateSpeed = 5.0
            // controls.zoomSpeed = 2.0
            // controls.panSpeed = 1.0
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
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
            //光源位置
            dirLight.position.set(100, 100, 100)
            this.scene.add(dirLight)
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
            let delta = this.clock.getDelta()

            this.renderer.render(this.scene,this.camera)
            
            this.controls.update(delta)

            TWEEN.update()
            this.mixer && this.mixer.update(delta)
            
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
            const model = await this.loadGLTFModel('model/lab/lab.gltf')
            this.setContent(model)
            model.visible = true
            this.scene.add(model)
            this.updateCondition()

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
        updateCondition() {
            const img = document.createElement('img')
            let screenList = {}, canvasList = {}, textureList = {}
            const that = this
            const nameList = ['Object_122', 'Object_146']
            img.onload = function() {
                for(let i = 0; i < nameList.length; i++) {
                    const canvas = document.createElement('canvas')
                    canvas.height = 700
                    canvas.width = 400
                    
                    const temp = (35 + Math.random()).toFixed(2)
                    const atm = (40 + Math.random()).toFixed(2)
                    const hr = (60 + Math.random()).toFixed(2)
                    
                    const ctx = canvas.getContext('2d')
                    ctx.fillStyle = "#000204"
                    ctx.fillRect(0,0,400,700)
                    ctx.fillStyle = "#0BF9EC"
                    ctx.font = "28px 微软雅黑"
                    ctx.fillText("温度：", 80,160)
                    ctx.fillText(temp+"℃", 220,160)
                    ctx.fillText("气压：", 80,220)
                    ctx.fillText(atm+"Ph", 220,220)
                    ctx.fillText("湿度：", 80,280)
                    ctx.fillText(hr+"%", 220,280)
                    ctx.drawImage(img, 150,20, 100,100)
                    const texture = new THREE.CanvasTexture(canvas)
                    texture.flipY = false
                    texture.anisotropy = 4
                    const material = new THREE.MeshPhongMaterial({map: texture})
                    const screen = that.scene.getObjectByName(nameList[i])
                    screen.material = material
                    canvasList[nameList[i]] = canvas
                    screenList[nameList[i]] = screen
                    textureList[nameList[i]] = texture
                }
            }
            img.src = '/images/top-img.png'

            let m = 0
            const interval = setInterval(function(){
                
                for(let i = 0; i < nameList.length; i++) {
                    const temp = (35 + Math.random()).toFixed(2)
                    const atm = (40 + Math.random()).toFixed(2)
                    const hr = (60 + Math.random()).toFixed(2)

                    const canvas = canvasList[nameList[i]]
                    const ctx = canvas.getContext('2d')
                    ctx.fillStyle = "#000204"
                    ctx.fillRect(0,0,400,700)
                    ctx.fillStyle = "#0BF9EC"
                    ctx.font = "28px 微软雅黑"
                    ctx.fillText("温度：", 80,160)
                    ctx.fillText(temp+"℃", 220,160)
                    ctx.fillText("气压：", 80,220)
                    ctx.fillText(atm+"Ph", 220,220)
                    ctx.fillText("湿度：", 80,280)
                    ctx.fillText(hr+"%", 220,280)
                    ctx.drawImage(img, 150,20, 100,100)
                    textureList[nameList[i]].needsUpdate = true
                }
                // if(m === 10) {
                //     clearInterval(interval)
                // }
                // m++
            },2000)
        },
        setContent ( object ) {

            this.clear();

            const box = new THREE.Box3().setFromObject(object);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            this.controls.reset();

            object.position.x += (object.position.x - center.x);
            object.position.y += (object.position.y - center.y);
            object.position.z += (object.position.z - center.z);
            this.controls.maxDistance = size * 10;
            this.camera.near = size / 100;
            this.camera.far = size * 100;
            this.camera.updateProjectionMatrix();

            this.controls.target.set(-0.7694850829682958,-0.2145974598898347,-1.099589312639896)

            this.camera.position.x = -0.6961399074647292
            this.camera.position.y = -0.20362183234341516
            this.camera.position.z = -1.0324074308867304
            
            this.controls.saveState();

            this.content = object;

            this.content.traverse((node) => {
                // TODO(https://github.com/mrdoob/three.js/pull/18235): Clean up.
                if(node.isMesh) {
                    node.material.depthWrite = !node.material.transparent;
                }
                
            });

            console.info('[glTF Viewer] THREE.Scene exported as `window.content`.');

        },
        clear () {
            const MAP_NAMES = [
                'map',
                'aoMap',
                'emissiveMap',
                'glossinessMap',
                'metalnessMap',
                'normalMap',
                'roughnessMap',
                'specularMap',
            ];
  
            if ( !this.content ) return;
        
            this.scene.remove( this.content );
        
            // dispose geometry
            this.content.traverse((node) => {
        
                if ( !node.isMesh ) return;
        
                node.geometry.dispose();
        
            } );
        
            // dispose textures
            traverseMaterials( this.content, (material) => {
        
                MAP_NAMES.forEach( (map) => {
        
                if (material[ map ]) material[ map ].dispose();
        
                } );
        
            } );
    
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

}

</style>
