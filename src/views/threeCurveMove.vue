<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import {getPublicData} from "@/api/requestData.js";

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

import * as d3 from 'd3'
import * as TWEEN from "@tweenjs/tween.js"

import LineBezierCurve3 from '@/utils/widgets/threeLineBezierCurve3/LineBezierCurve3.js'


// const d3 = Object.assign({}, require("d3-selection"), require("d3-geo"), require("d3-path"));

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
        this.depth = 1.5 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        this.time = 0
        this.offset = 0

        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        
        this.initScene()
        
        this.addState()
        this.initControls()
        await this.drawMap()
        this.createGlowShield()
        this.initLight()

        this.addClickListener()
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
            scene.background = new THREE.Color('rgba(27,70,74,1)')
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(-14.456769942107844, -71.19885462541396, 33.97815779661912)
            camera.up.set(0.1983664665508465, 0.9331522571120768, -0.31301375368286083)
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
            //OrbitControls参数设置
            // controls.enableDamping = true
            //TrackballControls参数设置
            controls.rotateSpeed = 2.0
            controls.zoomSpeed = 2.0
            controls.panSpeed = 1.0
            this.controls = controls
        },
        initLight() {
            this.initAmbientLight()
            // this.initPointLight()
            this.initDirectionalLight()
            this.initDirectionalLight1()
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
            dirLight.position.set(-16, -12, 0)
            //可以产生阴影
            // dirLight.castShadow = true
            // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.target = this.target
            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 50
            dirLight.shadow.camera.left = -20
            dirLight.shadow.camera.right = 20
            dirLight.shadow.camera.top = 20
            dirLight.shadow.camera.bottom = -20
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示灯光范围
            // const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            // this.scene.add(debugCamera)
        },
        initDirectionalLight1() {
            //方向光
            const dirLight = new THREE.DirectionalLight('#fff', 0.2)
            //光源位置
            dirLight.position.set(-10, -5, 5)
            //可以产生阴影
            // dirLight.castShadow = true
            // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.target = this.target
            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 50
            dirLight.shadow.camera.left = -20
            dirLight.shadow.camera.right = 20
            dirLight.shadow.camera.top = 20
            dirLight.shadow.camera.bottom = -20
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示灯光范围
            // const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            // this.scene.add(debugCamera)
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
            // this.composer.render(this.clock.getDelta())//后处理
            
            // this.controls.update()//OrbitControls
            this.controls.update(this.clock.getDelta())//TrackballControls

            // this.texture.needsUpdate = true
            
            this.state.update();
            this.myAnimate = requestAnimationFrame(this.animate);
            TWEEN.update()

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
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        async getData(url){
            let data = await getPublicData(url)
            return data.features;
        },
        async drawMap() {
            await this.drawExtrudeMap()
        },
        async drawExtrudeMap() {
            const group = new THREE.Group()
            const lineGroup = new THREE.Group()
            let features = await this.getData('data/tongliao.geojson')

            this.center = this.computeFeaturesCenter(features)
            features.forEach((feature) => {
                feature.geometry.coordinates.forEach(coordinate => {
                    coordinate.forEach(points => {
                        let points_prj = []
                        points.forEach(point => {
                            points_prj.push(this.projection(point, this.center))
                        })
                        let item = this.drawExtrude(this.drawShape(points_prj))
                        item.label = feature.properties.name

                        this.reMapUv(item.geometry)

                        let lines = this.drawLine(points_prj)
                        lines.forEach(line => {
                            // this.adjustModel(line)
                            lineGroup.add(line)
                        })
                        group.add(item)

                    })
                    
                }) 
            })
            this.target = group
            this.scene.add(group)
            this.scene.add(lineGroup)
        },
        drawShape(posArr) {
            var shape = new THREE.Shape()
            shape.moveTo(posArr[0][0], posArr[0][1])
            posArr.forEach(item => {
                shape.lineTo(item[0], item[1])
            })
            return shape
        },
        drawExtrude(shapeObj) {
            const extrudeSettings = {
                steps: 2,
                depth: this.depth,
                bevelEnabled: false
            }
            let geometry = new THREE.ExtrudeGeometry(shapeObj,extrudeSettings)

            let material1 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( 'rgba(33,76,65,1)' ),
                specular: new THREE.Color('rgba(50,88,68,1)'),
                shininess: 32.0,
            })
            let material2 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( 'rgba(33,76,60,1)' ),
                specular: new THREE.Color('rgba(39,60,50,1)'),
                shininess: 32.0
            })
            let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2])
            // shapeGeometryObj.position = geometry.boundingSphere.center
            // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
            shapeGeometryObj.name = 'board'
            return shapeGeometryObj
        },
        drawLine(posArr) {
            let geometry1 = new THREE.BufferGeometry()
            let geometry2 = new THREE.BufferGeometry()
            let verticesList1 = []
            let verticesList2 = []
            posArr.forEach(item => {
                verticesList1.push(item[0])
                verticesList1.push(item[1])
                verticesList1.push(this.depth)
                verticesList2.push(item[0])
                verticesList2.push(item[1])
                verticesList2.push(-0.001)
            })
            const vertices1 = new Float32Array(verticesList1)
            const vertices2 = new Float32Array(verticesList2)
            geometry1.setAttribute('position',new THREE.BufferAttribute(vertices1,3))
            geometry2.setAttribute('position',new THREE.BufferAttribute(vertices2,3))
            let lineMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color('rgb(70,117,92)') })
            let line1 = new THREE.Line(geometry1, lineMaterial)
            let line2 = new THREE.Line(geometry2, lineMaterial)
            line1.name = 'line'
            line2.name = 'line'
            return [line1, line2]
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
        projection(point, center) {
            const projection = d3.geoMercator().center(center).translate([0, 0]).reflectY(90).scale(1000)
            // const projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]).reflectY(90)
            // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
            return projection(point)
        },
        computeFeaturesCenter(features) {
            let coordinateList = []
            features.forEach(feature => {
                feature.geometry.coordinates.forEach(coordinate => {
                    coordinate.forEach(points => {
                        coordinateList.push(...points)
                    })
                })
            })
            let xMax = Math.max(...coordinateList.map(item => { return item[0] }))
            let xMin = Math.min(...coordinateList.map(item => { return item[0] }))
            let yMax = Math.max(...coordinateList.map(item => { return item[1] }))
            let yMin = Math.min(...coordinateList.map(item => { return item[1] }))
            //计算最值的另一种方法
            // let xMax1 = coordinateList.sort((a,b) => { return b[0]-a[0]})[0][0]
            // let xMin1 = coordinateList.sort((a,b) => { return a[0]-b[0]})[0][0]
            let center = [(xMax + xMin)/2, (yMax + yMin)/2]
            return center
        },
        createGlowShield() {
            let nodeList = [
                [0,0,0+this.depth],
                [0,10,10+this.depth],
                [10,10,10+this.depth],
                [10,0,0+this.depth]
            ]
            let curve = new LineBezierCurve3(nodeList)
            const points = curve.getPoints(200)
            const lineGeometry = new THREE.BufferGeometry().setFromPoints( points )
            const lineMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color('rgba(5,50,20,1)')
            });
            const line = new THREE.Line( lineGeometry, lineMaterial )

            this.scene.add( line )
            const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 )
            const cubeMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color( 'rgba(184,179,46,1)' ),
                specular: new THREE.Color('rgba(55,55,55,1)'),
                shininess: 32.0
            })
            const cube = new THREE.Mesh( cubeGeometry, cubeMaterial )
            this.scene.add( cube )
            this.pathNavigation(curve,cube,5000)

        },
        pathNavigation(curve, object, duration = 2000) {
            return new Promise((resolve) => {
                const tween = new TWEEN.Tween({ t: 0 })
                tween.to({ t: 1 }, duration);
                tween.onUpdate(({ t }) => {
                    object.position.copy(curve.getPoint(t)) // 每帧更新位置
                    if(t < 0.99) {
                        object.lookAt(curve.getPoint(t+0.01))// 朝向
                    }
                    
                })
                tween.repeat(Infinity)
                tween.onComplete(resolve)
                tween.start();
            });
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
