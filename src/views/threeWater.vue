<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { Water } from '@/utils/widgets/Water/Water2.js';
import { Refractor } from 'three/examples/jsm/objects/Refractor.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js'

import RefractionMaterial from '@/utils/widgets/Water/RefractionMaterial.js';

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

        this.createWater()
        // this.createWater2()
        // this.createBox()
        this.createRefraction()
        // this.createReflection()
        this.loadModels()
        
        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        this.animate()

        this.water()
        
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
        water(){

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
            console.log(camera)

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

            const loader = new THREE.CubeTextureLoader();
            const texture = loader.load([
                'images/posx.jpg',
                'images/negx.jpg',
                'images/posy.jpg',
                'images/negy.jpg',
                'images/posz.jpg',
                'images/negz.jpg',
            ]);
            // this.scene.background = texture;

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
            const ambientLight = new THREE.AmbientLight("#ffffff",3);
            this.scene.add(ambientLight)
        },
        initDirectionalLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight('#fff', 0.5)
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

            const time = this.clock.getElapsedTime()
            if(this.refractor){
                this.refractor.material.uniforms.time.value = time;
            }
            
            
            this.state.update();
            this.myAnimate = requestAnimationFrame(this.animate);
        },
        onWindowResize() {
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        createBox() {
            const geometry = new THREE.BoxGeometry(60,60,60)

            const material = new THREE.MeshStandardMaterial({
                color: 0x2E2E2E,
                emissive: 0x0,
                roughness: 0,
                metalness: 0,
                depthWrite: true,
                depthTest: true,
                side: THREE.BackSide
            })

            const box = new THREE.Mesh(geometry, material)
            // box.position.set(0,30,0)
            this.scene.add(box)
        },
        createWater2() {
            const texture = new THREE.TextureLoader().load('images/water5.png')
            texture.wrapS = THREE.MirroredRepeatWrapping
            texture.wrapT = THREE.MirroredRepeatWrapping
            texture.repeat = new THREE.Vector2(3,3)
            const waterGeometry = new THREE.PlaneGeometry(67.4,67)
            const waterMaterial1 = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                // color: 0x82AAFF,
                opacity: 0.3,
                anisotropy: 4
            })
            const water1 = new THREE.Mesh(waterGeometry, waterMaterial1)
            water1.rotation.x = -Math.PI/2
            water1.position.set(-32,2,-3)
            this.scene.add(water1)

            const waterMaterial2 = new THREE.MeshPhysicalMaterial({
                color: 0x0008FF,
                roughness: 0.4,
                metalness: 0,
                reflectivity: 0.5,
                // alphaMap: texture1,
                transmission: 0.9,
                specularTint: 0x002FFF,
                side: THREE.DoubleSide,
                opacity: 1,
                transparent: true,
            })
            const water2 = new THREE.Mesh(waterGeometry, waterMaterial2)
            water2.rotation.x = -Math.PI/2
            water2.position.set(-32,2,-3)
            this.scene.add(water2)

            const refractorGeometry = new THREE.PlaneGeometry(67.4,67)
            const verticalMirror = new Reflector( refractorGeometry, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x889999,
                transparent: true,
                opacity: 0.5
            } );
            verticalMirror.rotation.x = -Math.PI/2
            verticalMirror.position.set(-32,2.1,-3)
            // this.scene.add( verticalMirror )
        },
        generateTexture() {

            const canvas = document.createElement( 'canvas' );
            canvas.width = 2;
            canvas.height = 2;

            const context = canvas.getContext( '2d' );
            context.fillStyle = 'white';
            context.fillRect( 0, 1, 2, 1 );

            return canvas;

        },
        createWater() {
            const waterGeometry = new THREE.PlaneGeometry(67.4,67)
            // const waterGeometry = new THREE.PlaneGeometry(40,40)
            const water = new Water( waterGeometry, {
                flowSpeed: 0.003,
                color: new THREE.Color(0xc8e9ff),
                scale: 0.5,
                flowDirection: new THREE.Vector2( 1, 1 ),
                textureWidth: 1024,
                textureHeight: 1024,
                clipBias: 0
            })
            water.rotation.x = -Math.PI/2
            water.position.set(-32,2,-3)
            // water.material.side = THREE.DoubleSide
            this.scene.add(water)
        },
        createRefraction() {
            const refractorGeometry = new THREE.PlaneGeometry(67.4,67)
            // const refractorGeometry = new THREE.PlaneGeometry(40,40)
            // const refractorGeometry = new THREE.PlaneGeometry(60,60)
            const refractor = new Refractor( refractorGeometry, {
                color: 0x999999,
                textureWidth: 1024,
                textureHeight: 1024,
                shader: WaterRefractionShader
            } );
            refractor.rotation.x = -Math.PI/2
            refractor.position.set(90,2,-80)
            // refractor.position.set(-32,2,-3)
            this.scene.add(refractor)
            const dudvMap = new THREE.TextureLoader().load( 'images/waterdudv.jpg');

            dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
            refractor.material.uniforms.tDudv.value = dudvMap;
            this.refractor = refractor

            // const texture = new THREE.TextureLoader().load('images/water5.png')
            // texture.wrapS = THREE.MirroredRepeatWrapping
            // texture.wrapT = THREE.MirroredRepeatWrapping
            // texture.repeat = new THREE.Vector2(3,3)
            // const refractorGeometry1 = new THREE.PlaneGeometry(60,60)
            // const refractorMaterial1 = new RefractionMaterial({
            //     envMap: texture,
            //     backfaceMap: texture,
            //     resolution: [window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio]
            // })
            // const mesh = new THREE.Mesh(refractorGeometry1, refractorMaterial1)
            // mesh.rotation.x = -Math.PI/2
            // mesh.position.set(-32,2,-3)
            // this.scene.add(mesh)

        },
        createReflection() {
            const refractorGeometry = new THREE.PlaneGeometry(67.4,67)
            const verticalMirror = new Reflector( refractorGeometry, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x889999,
                transparent: true,
                opacity: 0.5
            } );
            verticalMirror.rotation.x = -Math.PI/2
            verticalMirror.position.set(-32,2,-3)
            this.scene.add( verticalMirror );

        },
        async loadModels() {
            // this.loadFBXModel()
            const model = await this.loadGLTFModel('model/labs_scene/scene.gltf')
            // model.scale.set(0.1,0.1,0.1)
            this.setContent(model)
            model.visible = true

            // this.scene.add(model)
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
            this.camera.near = 1;
            this.camera.far = size * 100;
            this.camera.updateProjectionMatrix();

            this.camera.position.set(15.333811054748097, 48.05107215754168, 60.06767057063598)
            this.controls.target.set(-24.74631671897528, -3.0815243860148955, 5.26366998191016)
            // this.camera.position.x += size / 7.0;
            // this.camera.position.y += size / 8;
            // this.camera.position.z += size / 5.5;
            
            this.camera.lookAt(center);
            this.controls.saveState();

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

}

</style>
