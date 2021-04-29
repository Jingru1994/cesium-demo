<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default ({
    name: "ThreePickView",
    data() {
        return {
            modelUrls: [
                '/model/vase-1.glb',
                '/model/compressor.glb',
                '/model/vase-2.glb'
            ]
        }
    },
    created() {
        this.models = []
        this.selectedObject = null
        this.$nextTick(() => {
        })
    },
    async mounted() {
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()
        this.loadModels()
        this.addOutlinePass()
        this.animate()
        // this.loadFBXModel()
    },
    beforeDestroy() {
        cancelAnimationFrame(this.animate)
        this.renderer = null
        this.scene = null
        this.camera = null
        this.models = null
    },
    methods: {
        initScene() {
            const scene = new THREE.Scene()
            this.scene = scene
            scene.background = new THREE.Color(0xa0a0a0 )
            // scene.fog = new THREE.Fog( 0xa0a0a0 , 300, 500);
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            camera.position.set(0, 30, 150)//camera默认放在中心点(0,0,0)，挪一下位置

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
            this.addGround()
        },
        addState(){
            let state = new Stats()
            this.state = state
            const container = document.querySelector('.three-view')
            container.appendChild(state.dom)
            
        },
        addGround() {
            const grid = new THREE.GridHelper( 1000, 50, 0x000000, 0x000000);
            grid.material.opacity = 0.2
            grid.material.transparent = true
            this.scene.add( grid )

            // ground
            const ground = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial( { color: '#8F8F8F', depthWrite: false } ) );
            ground.rotation.x = - Math.PI / 2
            ground.name = "ground"
            this.scene.add(ground)
        },
        initControls() {
            const controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls = controls
            controls.enableDamping = true
        },
        initLight() {
            this.initAmbientLight()
            // this.initDirectionalLight()
        },
        initAmbientLight() {
            //环境光
            const ambientLight = new THREE.AmbientLight("#ffffff");
            this.scene.add(ambientLight)

            //比较自然的环境光
            // const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
            // hemLight.position.set(200, 100, 200)
            // this.scene.add(hemLight)
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
            this.controls.update()
            // trackballControls.update(clock.getDelta());
            // this.renderer.render(this.scene,this.camera)
            this.composer.render();
            this.state.update();
            requestAnimationFrame(this.animate);
        },
        resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement
            var width = window.innerWidth
            var height = window.innerHeight
            var canvasPixelWidth = canvas.width / window.devicePixelRatio
            var canvasPixelHeight = canvas.height / window.devicePixelRatio

            const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
            if (needResize) {
                this.renderer.setSize(width, height, false)
            }
            return needResize
        },
        onWindowResize() {

            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        },
        addOutlinePass() {
            const that = this
            let selectedObjects = []
            let composer = new EffectComposer(this.renderer)
            this.composer = composer
            const renderPass = new RenderPass(this.scene,this.camera)
            composer.addPass(renderPass)

            let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth,window.innerWidth),this.scene,this.camera)
            outlinePass.visibleEdgeColor.set('#FF0000')
            outlinePass.hiddenEdgeColor.set('#FF0000')
            outlinePass.edgeStrength =  3
            outlinePass.edgeGolw = 1.5
            outlinePass.edgeThickness = 1
            // outlinePass.pulsePeriod = 3

            composer.addPass(outlinePass)

            let effectFXAA = new ShaderPass(FXAAShader)
            effectFXAA.uniforms['resolution'].value.set(1/window.innerWidth,1/window.innerWidth)
            composer.addPass(effectFXAA)

            this.renderer.domElement.addEventListener('pointermove',onPointerMove)
            let mouse = new THREE.Vector2();
            function onPointerMove(event) {
                if ( event.isPrimary === false ) return;
                mouse.x = (event.clientX/window.innerWidth)*2 - 1
                mouse.y = -(event.clientY/window.innerHeight)*2 + 1
                checkInterSection()
            }

            function checkInterSection() {
                const raycaster = new THREE.Raycaster()
                raycaster.setFromCamera(mouse,that.camera)
                const intersects = raycaster.intersectObject(that.scene,true)
                if(intersects.length > 0 && !(intersects[0].object instanceof THREE.GridHelper) && intersects[0].object.name !== 'ground') {
                    console.log(intersects[0].object)
                    console.log(!that.selectedObject)
                    if(!that.selectedObject || that.selectedObject !== intersects[0].object) {
                        that.selectedObject = intersects[0].object
                        selectedObjects = [];
                        selectedObjects.push(that.selectedObject);
                        outlinePass.selectedObjects = selectedObjects
                    }
                }else {
                    outlinePass.selectedObjects = []
                }
            }
        },
        async loadModels() {
            for(let i = 0; i < this.modelUrls.length; i++) {
                  let model = await this.loadGLTFModel(this.modelUrls[i])
                  this.models.push(model)
                  console.log(model)
                  if(i === 0){
                        model.position.x = -50
                  }else if(i === 2){
                        model.position.x = 50
                  }
                  this.scene.add(model)
            }
            
        },
        loadGLTFModel(url) {  
            const p = new Promise((resolve,reject) => {
                const gltfLoader = new GLTFLoader()
                gltfLoader.load(
                    url,
                    (gltf) => {
                        let model = gltf.scene
                        this.adjustModel(model)
                        resolve(model)
                    },
                    ( xhr ) => {
                        // called while loading is progressing
                        console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` )
                    },
                    ( error ) => {
                        // called when loading has errors
                        console.error( 'An error happened', error )
                    },
                )
            })
            return p
        },
        adjustModel(model) {
            //调整模型尺寸
            model.scale.set(0.1,0.1,0.1)
            //调整模型中心
            model.traverse(function(o){
                if(o.isMesh) {
                    // o.geometry.computeBoundingBox()
                    o.geometry.center()
                }
            })
            
            //调整模型位置至场景中心
            let bBox = new THREE.Box3()
            bBox.setFromObject(model)
            let mLen = bBox.max.x - bBox.min.x
            let mWid = bBox.max.z - bBox.min.z
            let mHei = bBox.max.y - bBox.min.y
            let x = bBox.min.x + mLen/2
            let y = bBox.min.y + mHei/2
            let z = bBox.min.z + mWid/2
            model.position.set(-x,mHei/2,-z)
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
    .timeline {
        position: absolute;
        height: 20px;
        width: 100%;
        // background: #fff;
        bottom: 50px;
        text-align:center;
        .line {
            display: inline-block;
            
            // float: left;
            height: 7px;
            margin: 0 10px;
            width: calc(100% - 1020px);
            background: rgb(67, 97, 163);
        }
        .point-list {
            position: absolute;
            // margin-top: -25px;
            display: inline-block;
            // float: left;
            height: 10px;
            width: calc(100% - 1000px);
            

        }
        .assist-container {
            height: 100%;
            display: flex;
            justify-content: space-between
        }
        .point {
            float: left;
            width: 20px;
            height: 20px;
            background: rgb(153, 170, 207);
            border-radius: 50%;
        }
        .point.active{
            background: rgb(83, 132, 236);
        }
    }
    .progress {
        position: absolute;
        bottom: 95px;
        left: 513px;
        width: 450px;
        display: flex;
        color: #fff;
        .progress-text{
            display: inline-block;
        }
        .progress-bar{
            width: 300px;
            color: #fff;
            .el-progress__text{
                color: #fff;
            }
        }
    }

}

</style>
