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
import * as d3 from 'd3-geo'

import DistrictTerrain from '@/utils/widgets/Terrain/DistrictTerrain.js'
import {getPublicData} from '@/api/requestData.js'
import RingSpriteMark from '@/utils/widgets/RingSpriteMark/RingSpriteMark.js';
import ExtendedTube from '@/utils/widgets/ExtendedTube/ExtendedTube.js';

export default ({
    name: "ThreeTourism",
    data() {
        return {
        }
    },
    created() {
    },
    async mounted() {
        this.clock = new THREE.Clock()
        this.meshAnimation = false
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        this.addDistrictLine()
        this.addGroundElements()
        
        this.addTerrain()
        // this.addMark()
        // this.addRoutes()
        // this.drawMap()
        
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
            scene.background = new THREE.Color(0x06091B)
            scene.fog = new THREE.Fog( '#06091B', 300, 500);
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            renderer.sortObject = false
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(-4.025961174328703, 64.68049465988572, 91.83877121577603)
            

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
            controls.target.set(-1.7073951515135204, -12.370792980039933, 3.121498692070242)
            // 缩放范围
            controls.minDistance = 50;
            // controls.maxDistance = 300;
            // 上下旋转范围
            // controls.minPolarAngle = 0;
            // controls.maxPolarAngle = Math.PI/3;
            // 左右旋转范围
            // controls.minAzimuthAngle = -Math.PI * (100 / 180);
            // controls.maxAzimuthAngle = Math.PI * (100 / 180);
            this.controls = controls
        },
        initLight() {
            this.initAmbientLight()
            // this.initPointLight()
            this.initDirectionalLight()
        },
        initAmbientLight() {
            //环境光
            const ambientLight = new THREE.AmbientLight("#ffffff",1);
            this.scene.add(ambientLight)
        },
        initDirectionalLight() {
            //方向光
            const dirLight = new THREE.DirectionalLight('#fff', 0.1)
            //光源位置
            dirLight.position.set(40, 80, 30)
            //可以产生阴影
            dirLight.castShadow = true
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.shadow.camera.near = 50
            dirLight.shadow.camera.far = 500
            dirLight.shadow.camera.left = -100
            dirLight.shadow.camera.right = 100
            dirLight.shadow.camera.top = 100
            dirLight.shadow.camera.bottom = -100
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示灯光方向
            // var debugCamera1 = new THREE.DirectionalLightHelper(dirLight)
            // this.scene.add(debugCamera1)
            const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            this.scene.add(debugCamera)
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
            

            TWEEN.update()
            this.outCircle.rotation.z += 0.01
            this.inCircle.rotation.z -= 0.005
            if(this.meshAnimation) {
                // this.mesh2.material.map.offset.x -= 0.005;
            }
            
            
        },
        onWindowResize() {
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        addMark() {
            const pointList = [new THREE.Vector3( 25, 6.6, -20 ),new THREE.Vector3( -10, 6.6, 6 ),new THREE.Vector3( -15, 6.6, 37 )]
            const labelList = ['一', '二', '三']
            for(let i =0; i < pointList.length; i++){
                const mark = new RingSpriteMark({
                    text: '地点'+ labelList[i]
                }).mesh
                mark.position.copy(pointList[i])
                this.scene.add(mark)
                mark.renderOrder = 4
            }
        },
        addRoutes() {
            const curve = new THREE.CatmullRomCurve3( [
                new THREE.Vector3( 25, 0, -20 ),
                new THREE.Vector3( 5, 0, 0 ),
                new THREE.Vector3( -5, 0, 5 ),
                new THREE.Vector3( -10, 0, 6 ),
                new THREE.Vector3( -11, 0, 8 ),
                new THREE.Vector3( -8, 0, 12 ),
                new THREE.Vector3( -5, 0, 15 ),
                new THREE.Vector3( -15, 0, 37 )
            ]);
            const options = {
                curve: curve,
                tubularSegments: 100,
                innerRadius: 0.2,
                percent: 0.1,
                innerColor: new THREE.Color(0xffffff),
                duration: 3000,
                pointsNum: 50,
                outerRadius: 0.5,
                outerColor: new THREE.Color(0xeee000),
                speedScale: -3
            }
            const route = new ExtendedTube(options).mesh
            route.castShadow = true;
            route.position.y = 6
            this.scene.add(route)
            setTimeout(() => {
                this.addMark()
            },3000)
        },
        addGroundElements() {
            const floorGeometry = new THREE.PlaneGeometry(1000,1000)
            const floorTexture = new THREE.TextureLoader().load('images/tourism/floor.png')
            floorTexture.wrapS = THREE.RepeatWrapping
            floorTexture.wrapT = THREE.RepeatWrapping
            floorTexture.repeat = new THREE.Vector2(40,40)
            const floorMaterial = new THREE.MeshStandardMaterial({
                map: floorTexture,
                // color: 0xffffff
            })
            const floor = new THREE.Mesh(floorGeometry, floorMaterial)
            floor.rotation.x = -Math.PI/2
            floor.position.set(0,-0.1,0)
            floor.receiveShadow = true;
            this.scene.add(floor)

            const outCircleGeometry = new THREE.PlaneGeometry(200,200)
            const outCircleTexture = new THREE.TextureLoader().load('images/tourism/outCircle.png')
            const outCircleMaterial = new THREE.MeshBasicMaterial({
                map: outCircleTexture,
                transparent: true
            })
            const outCircle = new THREE.Mesh(outCircleGeometry, outCircleMaterial)
            outCircle.rotation.x = -Math.PI/2
            outCircle.position.set(0,-0.05,0)
            // this.scene.add(outCircle)
            this.outCircle = outCircle

            const inCircleGeometry = new THREE.PlaneGeometry(100,100)
            const inCircleTexture = new THREE.TextureLoader().load('images/tourism/inCircle.png')
            const inCircleMaterial = new THREE.MeshBasicMaterial({
                map: inCircleTexture,
                transparent: true
            })
            const inCircle = new THREE.Mesh(inCircleGeometry, inCircleMaterial)
            inCircle.rotation.x = - Math.PI/2
            inCircle.position.set(0,-0.01,0)
            this.inCircle = inCircle
            // this.scene.add(inCircle)

            
        },
        async addTerrain() {
            let features = await this.getData('data/beijing.geojson')
            const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem.png')
            const diffuseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite.png')
            const options =  {
                width: 100,
                height: 100,
                depth: 1,
                heightRatio: 1,
                heightTexture: heightTexture,
                diffuseTexture: diffuseTexture,
                data: features
            }
            const terrain = new DistrictTerrain(options).mesh
            console.log(terrain)
            terrain.castShadow = true;
            terrain.receiveShadow = true;
            terrain.rotation.x = -Math.PI/2
            this.scene.add(terrain)
            terrain.renderOrder = 3

            console.log(terrain)
            const terrainTween = new TWEEN.Tween({scale: 0})
                .to({scale: 5}, 3000)
                .onUpdate(({scale}) => {
                    terrain.scale.set(1,1,scale)
                    terrain.position.y = options.depth*scale
                })
                .onComplete(()=>{
                    this.addRoutes()
                })
                .start()
        },
        projection(point, scale) {
            const projection = d3.geoMercator().center([116.4573325, 40.249706]).translate([0, 0]).reflectY(90).scale(scale)
            // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
            return projection(point)

        },
        async addDistrictLine() {
            const data = await getPublicData('data/beijing.geojson')
            const features = data.features
            let line1,line2;
            features.forEach((feature) => {
                feature.geometry.coordinates.forEach(child => {
                    child.forEach(points => {
                        let points_prj = []
                        points.forEach(point => {
                            points_prj.push(this.projection(point, 2850))
                        })
                        line1 = this.drawLine(points_prj,new THREE.Color(0xCBD64D))
                        line1.scale.set(1,0.96,1)
                        this.scene.add(line1)
                        line1.rotation.x = -Math.PI/2
                        line1.position.set(0,0.3,0)
                        line2 = this.drawLine(points_prj,new THREE.Color(0xCBD64D))
                        line2.scale.set(1,0.96,1)
                        this.scene.add(line2)
                        line2.rotation.x = -Math.PI/2
                        line2.position.set(0,1,0)
                        
                        
                    })
                }) 
            })
            const lineTween1 = new TWEEN.Tween({positionZ: 1})
                .to({positionZ: 4}, 2500)
                .onUpdate(({positionZ}) => {
                    line1.position.set(0, 0.3*positionZ, 0)
                    line2.position.set(0, 0.8*positionZ, 0)
                })
                .start()
        },
        drawLine(posArr, color) {
            let geometry = new THREE.BufferGeometry()
            let verticesList = []
            posArr.forEach(item => {
                verticesList.push(item[0])
                verticesList.push(item[1])
                verticesList.push(0)
            })
            const vertices = new Float32Array(verticesList)
            geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
            let lineMaterial = new THREE.LineBasicMaterial({ color: color })
            let line = new THREE.Line(geometry, lineMaterial)
            line.name = 'line'
            return line
        },
        async getData(url){
            let data = await getPublicData(url)
            return data.features;
        },
        async drawMap() {
            const group = new THREE.Group()
            let features = await this.getData('data/beijing.geojson')
            features.forEach((feature) => {
                feature.geometry.coordinates.forEach(child => {
                    child.forEach(points => {
                        let points_prj = []
                        points.forEach(point => {
                            points_prj.push(this.projection(point, 2850))
                        })
                        console.log(points_prj)
                        let item = this.drawExtrude(this.drawShape(points_prj))
                        this.reMapUv(item.geometry)
                        item.rotation.x = -Math.PI/2
                        group.add(item)
                        
                        
                    })
                }) 
            })
            this.scene.add(group)
            this.group = group
            console.log(this.group)
        },
        reMapUv(geometry) {
            geometry.computeBoundingBox()
            const max = geometry.boundingBox.max
            const min = geometry.boundingBox.min
            const offset = new THREE.Vector2(0 - min.x, 0 - min.y)
            const range = new THREE.Vector2(max.x - min.x, max.y - min.y)
            const uvArray = geometry.getAttribute('uv')
            for(let i = 0; i < uvArray.array.length; i++){
                uvArray.array[i] = i % 2 ? (uvArray.array[i]+ offset.y) / range.y  : (uvArray.array[i] + offset.x) / range.x
            }
            geometry.setAttribute('uv', uvArray)
        },
        drawShape(posArr) {
            var shape = new THREE.Shape()
            shape.moveTo(posArr[0][0], posArr[0][1])
            posArr.forEach(item => {
                shape.lineTo(item[0], item[1])
            })
            return shape
        },
        // drawShape(posArr,offsetX,offsetY) {
        //     var shape = new THREE.Shape()
        //     shape.moveTo(posArr[0][0]+offsetX, posArr[0][1]+offsetY)
        //     posArr.forEach(item => {
        //         shape.lineTo(item[0]+offsetX, item[1]+offsetY)
        //     })
        //     return shape
        // },
        drawExtrude(shapeObj) {
            const extrudeSettings = {
                steps: 2,
                depth: 10,
                bevelEnabled: false
            }
            let geometry = new THREE.ExtrudeGeometry(shapeObj,extrudeSettings)
            let material1 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( '#161E32' ),
                specular: new THREE.Color('#334676'),
                // specular: 0x111111,
                shininess: 32.0,
                wireframe: true
            })
            let material2 = new THREE.MeshBasicMaterial({
                color: 0x008bfb
            })
            const vertexShader = `
                uniform sampler2D heightMap;
                uniform float heightRatio;
                uniform float depth;

                varying vec2 vUv;
                varying float hValue;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    hValue = texture2D(heightMap, vUv).r;
                    pos.z = hValue * heightRatio +10.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
                }
            `;
            const fragmentShader = `
                uniform sampler2D heightMap;
                uniform sampler2D diffuseMap;

                varying float hValue;
                varying vec2 vUv;
                void main() {
                    float alpha;
                    alpha = 1.0;
                    gl_FragColor = vec4(texture2D(diffuseMap, vUv).rgb, alpha );
                }
            `;
            const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem.png')
            const diffiseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite.png')
            
            const terrainMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    depth: {value: 5},
                    heightRatio: {value: 10},
                    heightMap: {value: heightTexture},
                    diffuseMap: {value: diffiseTexture}
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
            });
            const shapeGeometry = new THREE.ShapeGeometry(shapeObj)
            const shape = new THREE.Mesh(shapeGeometry,material1)
            console.log(shape)
            this.scene.add(shape)
            let shapeGeometryObj = new THREE.Mesh(geometry, [terrainMaterial, material2])
            // shapeGeometryObj.position = geometry.boundingSphere.center
            // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
            shapeGeometryObj.name = 'board'
            return shapeGeometryObj
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
