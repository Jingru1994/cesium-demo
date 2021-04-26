<template>
    <div class="three-view">
        <canvas id="three"></canvas>
        <div class="timeline">
            <div class="point-list">
                <div class="assist-container">
                    <div v-for="point in pointList" :key="point.id" class="point" :class="{'active':point.id===currentIndex}" @mouseover="change(point.id)"></div>
                </div>
                
            </div>
            <div class="line"></div>
            
        </div>
        <div class="progress" v-show="isActive">
        <!-- <div class="progress"> -->
            <div class="progress-text">{{currentModel}}:</div>
            <el-progress class="progress-bar" :percentage="loadPercentage" ></el-progress>
        </div>
    </div>
</template>
<script>
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader  } from 'three/examples/jsm/loaders/DRACOLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { AnimationMixer } from 'three/src/animation/AnimationMixer'

export default ({
    name: "ThreeModelView",
    data() {
        return {
            pointList: [
                {
                    time: 'First Period',
                    id: 0
                },
                {
                    time: 'Second Period',
                    id: 1
                },
                {
                    time: 'Third Period',
                    id: 2
                }
            ],
            currentIndex: 0,
            timer: '',
            modelUrls: [
                '/model/vase-1.glb',
                '/model/compressor.glb',
                '/model/vase-2.glb'
            ],
            models: [],
            yOffset: -40,
            loadPercentage: 0,
            isActive: true,
            currentModel: ''
        }
    },
    created() {
        this.$nextTick(() => {
            
        })
    },
    async mounted() {
        this.initScene()
        this.initControls()
        this.initLight()
        this.loadModels()
        this.animate()
        // let s = this.loadGLTFModel('/model/vase-1.glb',loaded)
        // s.then(function(m){
        //     console.log('m1',m)
        // })
        // this.loadFBXModel()
        
        
    },
    watch: {
        currentIndex: {
            handler: function(newVal, oldVal) {
                if(this.models.length === 3) {
                    this.models[oldVal].visible = false
                    this.models[newVal].visible = true
                }
            }
        }
    },
    methods: {
        initScene() {
            const scene = new THREE.Scene()
            this.scene = scene
            scene.background = new THREE.Color(0xa0a0a0)
            scene.fog = new THREE.Fog( '#04613b', 200, 450 );
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            camera.position.set(0, 0, 150)//camera默认放在中心点(0,0,0)，挪一下位置

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

            // // 加载背景图片
            var textureLoader = new THREE.TextureLoader();
            var texture = textureLoader.load('/picture/threeBackground.png');
            // 纹理对象Texture赋值给场景对象的背景属性.background
            scene.background = texture
            const material = new THREE.MeshBasicMaterial({
                map: texture
            })
            this.addGround()
            this.addCircle()
            
        },
        addCircle() {
            let explosionTexture = new THREE.TextureLoader().load(
                '/picture/circle.png'
            )
            explosionTexture.flipY = false
            const material = new THREE.MeshBasicMaterial({
                map: explosionTexture,
                side: THREE.DoubleSide
            })
            const geometry = new THREE.CircleGeometry( 25, 32 );
            // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
            const circle = new THREE.Mesh( geometry, material );
            this.circle = circle
            circle.material.transparent = true
            this.scene.add(circle)
            circle.rotation.x = - Math.PI / 2
            circle.position.y = this.yOffset
        },
        addGround() {
            const grid = new THREE.GridHelper( 2000, 100, '#0bcf9d', '#0bcf9d' );
            grid.material.opacity = 0.2;
            grid.material.transparent = true;
            grid.position.y = this.yOffset
            this.scene.add( grid );

            // ground
            // const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 500 ), new THREE.MeshPhongMaterial( { color: '#07b887', depthWrite: false } ) );
            // mesh.material = new THREE.ShaderMaterial({
            //     uniforms: {
            //         color1: {
            //         value: new THREE.Color("red")
            //         },
            //         color2: {
            //         value: new THREE.Color("purple")
            //         }
            //     },
            //     vertexShader: `
            //         varying vec2 vUv;

            //         void main() {
            //         vUv = uv;
            //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            //         }
            //     `,
            //     fragmentShader: `
            //         uniform vec3 color1;
            //         uniform vec3 color2;
                
            //         varying vec2 vUv;
                    
            //         void main() {
                    
            //         gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            //         }
            //     `,
            //     wireframe: true
            // });
            // mesh.rotation.x = - Math.PI / 2;
            // mesh.receiveShadow = true;
            // mesh.position.y = -50
            // this.scene.add( mesh );
        },
        initControls() {
            const controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls = controls
            controls.enableDamping = true
            // controls.target.y = this.yOffset

            // TrackballControls
            // var clock = new THREE.Clock();
            // var trackballControls = new TrackballControls(camera, renderer.domElement);
            // trackballControls.rotateSpeed = 10.0;
            // trackballControls.zoomSpeed = 10.0;
            // trackballControls.panSpeed = 10.0;
        },
        initLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
            //光源位置
            dirLight.position.set(100, 100, 100)
            //可以产生阴影
            dirLight.castShadow = true
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            this.scene.add(dirLight)
            //显示灯光方向
            var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            this.scene.add(debugCamera1)
            //显示阴影
            // debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            // this.scene.add(debugCamera)
            
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
            
            if(this.models.length === this.modelUrls.length){
                this.speed += 0.01
                this.models.forEach(model => {
                    model.rotation.y += 0.01
                })
            }
            this.circle.rotation.z += 0.02
            this.renderer.render(this.scene,this.camera)
            // trackballControls.update(clock.getDelta());
            requestAnimationFrame(this.animate)
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
        async loadModels() {
            for(let i = 0; i < this.modelUrls.length; i++) {
                this.currentModel = this.pointList[i].time
                let model = await this.loadGLTFModel(this.modelUrls[i])
                this.models.push(model)
                console.log(model)
                if(i === 0){
                    model.visible = true
                }
            }
            this.isActive = false
            this.timer = setInterval(() => {
                this.autoPlay()
            }, 4000)
            
        },
        loadGLTFModel(url) {  
            const p = new Promise((resolve,reject) => {
                const gltfLoader = new GLTFLoader()
                gltfLoader.load(
                    url,
                    (gltf) => {
                        let model = gltf.scene
                        model.traverse((o)=>{
                            // 加材质，这里其实不需要
                            // if(o.material && o.material.name === "material_0") {
                            //     let explosionTexture = new THREE.TextureLoader().load(
                            //         '/model/Vase-obj_0.jpg.001.jpg'
                            //     )
                            //     explosionTexture.flipY = false
                            //     const material = new THREE.MeshBasicMaterial({
                            //         map: explosionTexture
                            //     })
                            //     o.material = material
                            // }
                            //让模型等每个部分都能产生阴影
                            if (o.isMesh) {
                                o.castShadow = true
                                o.receiveShadow = true
                            }
                        })
                        this.scene.add(model)
                        this.adjustModel(model)
                        model.visible = false
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
        loadDracoGLTFModel() {
            let loader = new GLTFLoader()
            let path = '/model/modelDraco.glb'
            let dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath( 'three/examples/js/libs/draco/gltf/' )//设置解压库文件路径
            loader.setDRACOLoader( dracoLoader )
            loader.load(
                path ,
                ( gltf ) => {
                    // called when the resource is loaded
                    console.log(gltf)
                    this.scene.add( gltf.scene )
                    this.model = gltf.scene
                    return gltf.scene
                },
                ( xhr ) => {
                    // called while loading is progressing
                    console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` )
                },
                ( error ) => {
                    // called when loading has errors
                    console.error( 'An error happened', error )
                },
            );
        },
        loadOBJModel() {
            const loader = new OBJLoader();
            const mtlLoader = new MTLLoader(); 
            mtlLoader.load(
                '/model/Vase-obj.mtl',
                (materials) => {
                    // 返回一个包含材质的对象MaterialCreator
                    console.log(materials);
                    //obj的模型会和MaterialCreator包含的材质对应起来
                    loader.setMaterials(materials)
                    loader.load(
                        // resource URL
                        '/model/Vase-obj.obj',
                        // called when resource is loaded
                        ( object ) => {
                            console.log(this)
                            this.scene.add( object )
                            this.model = object
                            return object
                        },
                        // called when loading is in progresses
                        function ( xhr ) {
                            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )

                        },
                    );
                }
            )
        },
        loadFBXModel() {
            const loader = new FBXLoader();
            loader.load(
                '/model/vase2.fbx',
                ( object ) => {
                    //动作
                    // let mixer = new AnimationMixer( object );
                    // const action = mixer.clipAction( object.animations[ 0 ] );
                    // action.play();
                    console.log(object)
                    console.log(object.children[0])
                    // let explosionTexture = new THREE.TextureLoader().load(
                    //     '/model/Vase-obj_0.jpg.001.jpg'
                    // )
                    // explosionTexture.flipY = false
                    // const material = new THREE.MeshBasicMaterial({
                    //     map: explosionTexture
                    // })
                    // object.children[0].material = material
                    this.scene.add(object.children[0])
                    this.model = object.children[0]
                    return object
                }
            );
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
            model.position.set(-x,mHei/2 +this.yOffset,-z)

            let boxHelper;
            boxHelper = new THREE.BoxHelper( model, 0x000000 ); //显示包围盒

            this.scene.add(boxHelper);

            // model.visible = false
        },
        autoPlay() {
            this.currentIndex++
            // debugger
            if (this.currentIndex >= this.pointList.length) {
                this.currentIndex = 0
            }
        },
        change(index) {
            this.currentIndex = index
            clearInterval(this.timer)
            this.timer = setInterval(() => {
                this.autoPlay()
            }, 4000)
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
