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
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
// import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import * as d3 from 'd3'
import * as dat from 'dat.gui'
import InnerGlowMaterial from '@/utils/widgets/InnerGlow/InnerGlowMaterial.js'
import ColumnCircleMark from '@/utils/widgets/ColumnCircleMark/ColumnCircleMark.js'
// const d3 = Object.assign({}, require("d3-selection"), require("d3-geo"), require("d3-path"));

// var TWEEN = require('@tweenjs/tween.js');

export default ({
    name: "ThreeMacroScene",
    data() {
        return {
        }
    },
    created() {
        
    },
    async mounted() {
        this.depth = 0.2 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        this.initScene()
        this.addState()
        this.initControls()
        await this.drawMap()
        // await this.drawColumnCircle()
        this.createColumnCircleMark()
        this.initLight()

        this.addClickListener()

        // let GUI = document.querySelector('.dg.main.a')
        // if(GUI) {
        //     GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        // }
        // this.initGUI()
        
        this.animate()
        
    },
    beforeDestroy() {
        cancelAnimationFrame(this.myAnimate)
        this.renderer = null
        this.scene = null
        this.camera = null
    },
    methods: {
        initGUI() {
            let guiControls = {
                lightX: -16,
                lightY: -12,
                lightZ: 0
            }
            if(!this.guiControls) {
                this.guiControls = guiControls
                const gui = new dat.GUI()
                gui.add(guiControls,'lightX', -100, 100)
                gui.add(guiControls,'lightY', -100, 100)
                gui.add(guiControls,'lightZ', -100, 100)
            }
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
            scene.background = new THREE.Color('rgba(27,70,74,1)')
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            // camera.position.set(0, 0, 50)//camera默认放在中心点(0,0,0)，挪一下位置
            camera.position.set(-2.2074636356036743, -13.61776549393699, 5.261517580471185)
            camera.up.set(0.16088540643481214, 0.9834879892160223, -0.12234075798377202)
            //下面参数对于调整camera视角没有作用
            // camera.rotation.set(1.148468910298315, -0.1261940903609752, -0.06956724055338868, "XYZ")
            // camera.quaternion.set(0.5436244764554815, -0.03405684915269789, -0.06337099294858563, 0.836239604944064)
            // camera.projectionMatrix.fromArray([1.0465640544361754, 0, 0, 0, 0, 2.1445069205095586, 0, 0, 0, 0, -1.00010000500025, -1, 0, 0, -0.200010000500025, 0])
            // camera.projectionMatrixInverse.fromArray([0.9555076880017046, -0, -0, -0, -0, 0.4663076581549986, -0, -0, -0, -0, -0, -4.999750000000001, -0, -0, -1.0000000000000002, 5.000250000000001])
            // camera.matrix.fromArray([0.9896484965570014, -0.143014941797194, -0.01194067356609442, 0, 0.06895839463575923, 0.40091309170242784, 0.9135170675531243, 0, -0.12585941789046107, -0.9048842021630976, 0.406625119248588, 0, -1.858292035616543, -13.360455134937972, 6.003747937551419, 1])
            // camera.matrixWorld.fromArray([0.9896484965570014, -0.143014941797194, -0.01194067356609442, 0, 0.06895839463575923, 0.40091309170242784, 0.9135170675531243, 0, -0.12585941789046107, -0.9048842021630976, 0.406625119248588, 0, -1.858292035616543, -13.360455134937972, 6.003747937551419, 1])
            // camera.matrixWorldInverse.fromArray([0.9896484965570015, 0.06895839463575924, -0.1258594178904611, 0, -0.14301494179719404, 0.40091309170242795, -0.904884202163098, 0, -0.011940673566094424, 0.9135170675531245, 0.4066251192485881, 0, -4.996003610813205e-16, 3.552713678800502e-15, -14.7648230602327, 1])
            
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

            //抗锯齿
            // let composer = new EffectComposer(renderer)
            // const renderPass = new RenderPass( scene, camera );
            // composer.addPass( renderPass );
            // // let FXAAShaderPass = new ShaderPass(FXAAShader)//对线没用
            // // FXAAShaderPass.uniforms['resolution'].value.set(1/width, 1/height)
            // // FXAAShaderPass.renderToScreen = true
            // // composer.addPass(FXAAShaderPass)
            // const pass = new SMAAPass( width * renderer.getPixelRatio(), height * renderer.getPixelRatio() );
            // composer.addPass( pass );
            // this.composer = composer
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
            dirLight.shadow.camera.left = -10
            dirLight.shadow.camera.right = 10
            dirLight.shadow.camera.top = 10
            dirLight.shadow.camera.bottom = -10
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
            // this.rippleCircleOpacityChange()
            this.renderer.render(this.scene,this.camera)

            // this.composer.render()//抗锯齿
            
            // this.controls.update()//OrbitControls
            this.controls.update(this.clock.getDelta())//TrackballControls

            // this.texture.needsUpdate = true
            
            this.state.update();
            this.myAnimate = requestAnimationFrame(this.animate);
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
            // this.drawRSImageMap()
            await this.drawGlowMap()
        },
        async drawExtrudeMap() {
            const group = new THREE.Group()
            const lineGroup = new THREE.Group()
            let features = await this.getData('data/tongliao.geojson')

            let rsTexture = new THREE.TextureLoader().load(
                '/images/rs/tongliaioL10.png'
            )
            rsTexture.wrapS = THREE.RepeatWrapping
            rsTexture.wrapT = THREE.RepeatWrapping
            rsTexture.flipY = true
            rsTexture.generateMipmaps = true
            rsTexture.anisotropy= 4//使纹理斜着的时候不变模糊，沿纹理单元密度最高方向的轴线所取样本数，默认为1，通常为2的幂，越大越清晰，但需要更多的采样，为4时就比较清楚了
            // rsTexture.anisotropy= this.renderer.getMaxAnisotropy()//getMaxAnisotropy()找到GPU有效最大的anisotropy值，这个设备为16
            
            let rsMaterial = new THREE.MeshBasicMaterial({
                map: rsTexture,
                transparent: true,
                // side: THREE.DoubleSide,
            })
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

                        item.material[0] = rsMaterial
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
        async drawGlowMap() {
            const group = new THREE.Group()
            let features = await this.getData('data/kerqin.geojson')
            let materialOptions = {
                glowColor: new THREE.Color('#F3FC93')
            }
            features.forEach((feature) => {
                
                feature.geometry.coordinates.forEach(coordinate => {
                    let inputFeature = JSON.stringify(feature)
                    inputFeature = JSON.parse(inputFeature)
                    inputFeature.geometry.coordinates = [coordinate]
                    let material = new InnerGlowMaterial(inputFeature, materialOptions).material

                    let points_prj = []
                    coordinate.forEach(points => {
                        // points一定只有一个，这一层应该就是geojson的格式
                        points.forEach(point => {
                            points_prj.push(this.projection(point, this.center))
                        })
                    })
                    let shape = this.drawShape(points_prj)
                    let geometry = new THREE.ShapeGeometry(shape)
                    
                    let item = new THREE.Mesh(geometry, material)
                    item.label = feature.properties.name

                    item.position.z = this.depth + 0.01

                    this.reMapUv(item.geometry)
                    item.renderOrder = 9 

                    //获取包围盒位置，获取几何中心坐标
                    let bBox2 = new THREE.Box3()
                    bBox2.setFromObject(item)
                    let x = bBox2.min.x + (bBox2.max.x - bBox2.min.x)/2
                    let y = bBox2.min.y + (bBox2.max.y - bBox2.min.y)/2
                    
                    // 调整模型中心
                    item.traverse(function(o){
                        if(o.isMesh) {
                            // o.geometry.computeBoundingBox()
                            o.geometry.center()
                        }
                    })

                    //调整模型位置
                    item.position.set(x,y, this.depth+0.01)

                    group.add(item)
                    
                }) 
            })

            this.scene.add(group)
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
                // color: new THREE.Color( 'rgba(49,80,64,1)' ),
                color: new THREE.Color( 'rgba(33,76,60,1)' ),
                specular: new THREE.Color('rgba(39,60,50,1)'),
                // specular: new THREE.Color('rgba(50,70,60,1)'),
                // specular: new THREE.Color('rgba(0,0,0,1)'),
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
                // uvArray.array[i] = i % 2 ? uvArray.array[i] / range.y + offset.y : uvArray.array[i] / range.x + offset.x
            }
            geometry.setAttribute('uv', uvArray)
            // console.log(geometry.getAttribute('uv'))
        },
        projection(point, center) {
            const projection = d3.geoMercator().center(center).translate([0, 0]).reflectY(90)
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
        createColumnCircleMark() {
            let options = {
                size: 1.5,
                text: '公司村',
                position: new THREE.Vector3(2.32, -1.0, this.depth + 0.02)
                // position: new THREE.Vector3(0, 0, this.depth + 0.1)
            }
            let mark = new ColumnCircleMark(options)
            mark.renderOrder = 50
            console.log(mark.mesh)
            this.scene.add(mark.mesh)
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
