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
            camera.position.set(40, 80, 100)
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
                side: THREE.FrontSide
            })
            const box = new THREE.Mesh(geometry, material)
            this.scene.add(box)

            const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem2.png')
            const diffiseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite2.png')
            const vertexShader = `
                uniform sampler2D heightMap;
                
                uniform float heightRatio;
                varying vec2 vUv;
                varying float hValue;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    hValue = texture2D(heightMap, vUv).r;
                    pos.z = hValue * heightRatio;
                    if(texture2D(heightMap, vUv).a < 1.0){
                        pos.z = 0.0;
                    }
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
                }
            `
            const fragmentShader = `
                uniform sampler2D heightMap;
                uniform sampler2D diffuseMap;
                varying float hValue;
                varying vec2 vUv;
                
                // honestly stolen from https://www.shadertoy.com/view/4dsSzr
                vec3 heatmapGradient(float t) {
                    return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
                }

                void main() {
                    // float v = abs(hValue - 1.);
                    // gl_FragColor = vec4(heatmapGradient(hValue), 1. - v * v) ;
                    float alpha;
                    if(texture2D(heightMap, vUv).a < 1.0){
                        alpha = 0.0;
                    } else {
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
                side: THREE.DoubleSide
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
            plane.position.set(0,60,60)
            this.scene.add(plane)
            

            

            
        },
        async getData(url){
            let data = await getPublicData(url)
            return data.features;
        },
        async drawMap() {
            const group = new THREE.Group()
            const lineGroup = new THREE.Group()
            let chinaGeometry = await this.getData('data/china.json')
            let i = 0
            chinaGeometry.forEach((province) => {
                province.geometry.coordinates.forEach(provinceChild => {
                    provinceChild.forEach(points => {
                        let points_prj = []
                        points.forEach(point => {
                            // let [x,y] 
                            points_prj.push(this.projection(point))
                        })
                        let item = this.drawExtrude(this.drawShape(points_prj))
                        item.label = province.properties.name
                        let lines = this.drawLine(points_prj)
                        lines.forEach(line => {
                            lineGroup.add(line)
                        })
                        // console.log(item.geometry.boundingSphere.radius)
                        group.add(item)

                    })
                    
                }) 
            })
            this.scene.add(group)
            this.scene.add(lineGroup)
            this.group = group
            console.log(this.group)
            this.lineGroup = lineGroup
        },
        drawShape(posArr) {
            var shape = new THREE.Shape()
            shape.moveTo(posArr[0][0], posArr[0][1])
            posArr.forEach(item => {
                shape.lineTo(item[0], item[1])
            })
            return shape
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
