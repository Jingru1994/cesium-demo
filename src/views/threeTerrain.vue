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

import * as d3 from 'd3'

import {getPublicData} from "@/api/requestData.js";

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

        this.createBox()
        // this.drawMap()
        
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
            camera.position.set(-5.14709175470227, -90.88794574377549, 49.01484670950189)
            

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
            controls.target.set(-3.860896027475691, -5.413075060127793, -9.888948486188504)
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
            const plane1 = new THREE.PlaneGeometry(100,100)
            const texture1 = new THREE.TextureLoader().load('images/kerqin.png')
            const material2 = new THREE.MeshBasicMaterial({
                map: texture1
            })
            const mesh1 = new THREE.Mesh(plane1, material2)
            this.scene.add(mesh1)
            mesh1.position.set(0,0,100)

            const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem5.png')
            heightTexture.anisotropy = 16
            const heightTexture1 = new THREE.TextureLoader().load('images/rs/beijing_dem5.png')
            const diffiseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite3.png')
            const vertexShader = `
                uniform sampler2D heightMap;
                
                uniform float heightRatio;
                varying vec2 vUv;
                varying float hValue;
                varying float isTrue;
                void main() {
                    isTrue = 1.0;
                    vUv = uv;
                    vec3 pos = position;
                    hValue = texture2D(heightMap, vUv).r;
                    pos.z = hValue * heightRatio;
                    if(texture2D(heightMap, vUv).a < 1.0){
                        pos.z = 0.0;
                        isTrue = 0.0;
                    }
                    if(texture2D(heightMap, vUv).r == 0.0 && texture2D(heightMap, vUv).b == 0.0){
                        pos.z = -3.0;
                    }
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
                }
            `
            const fragmentShader = `
                uniform sampler2D heightMap;
                uniform sampler2D diffuseMap;
                varying float hValue;
                varying vec2 vUv;
                varying float isTrue;
                void main() {
                    float alpha;
                    alpha = 0.0;
                    if(isTrue == 1.0){
                        alpha = 1.0;
                    }
                    gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, alpha );
                }
            `
            const material1 = new THREE.ShaderMaterial({
                uniforms: {
                    heightMap: {value: heightTexture},
                    heightRatio: {value: 3},
                    diffuseMap: {value: diffiseTexture}
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                // side: THREE.DoubleSide
            })

            // heightTexture.
            const planeGeometry = new THREE.PlaneGeometry(100,100,500,500)
            const planeMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                map: diffiseTexture,
                side: THREE.DoubleSide
            })
            const plane = new THREE.Mesh(planeGeometry,material1)
            // plane.rotation.x = Math.PI/4
            // plane.position.set(0,60,60)
            this.scene.add(plane)

            const vertexShader1 = `
                varying vec2 vUv;
                void main() {
                    
                    vUv = uv;
                    vec3 pos = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
                }
            `
            const fragmentShader1 = `
                uniform sampler2D heightMap1;
                uniform vec3 color;
                varying vec2 vUv;
                void main() {
                    float alpha = 0.0;
                    float isTrue = 1.0;
                    if(texture2D(heightMap1, vUv).a < 1.0){
                        isTrue = 0.0;
                    }
                    if(isTrue == 1.0){
                        alpha = 1.0;
                    }
                    
                    // float alpha = 1.0;
                    // if(texture2D(heightMap1, vUv).a < 1.0){
                    //     alpha = 0.0;
                    // }

                    gl_FragColor = vec4(color.rgb, alpha);
                }
            `

            const bottomGeometry = new THREE.PlaneGeometry(100,100,500,500)
            const bottomMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    heightMap1: {value: heightTexture1},
                    color: {value: new THREE.Color(0x244931)}
                },
                vertexShader: vertexShader1,
                fragmentShader: fragmentShader1,
                transparent: true,
                side: THREE.DoubleSide
            })
            const bottomPlane = new THREE.Mesh(bottomGeometry,bottomMaterial)
            bottomPlane.position.set(0,0,-3)
            this.scene.add(bottomPlane)
            
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
