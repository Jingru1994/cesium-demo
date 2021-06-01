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
import * as d3 from 'd3-geo'
import * as dat from 'dat.gui'
// var TWEEN = require('@tweenjs/tween.js');

export default ({
    name: "ThreeScanCircle",
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
            //GUI参数调整
            // this.dirLight.position.x = this.guiControls.lightX
            // this.dirLight.position.y = this.guiControls.lightY
            // this.dirLight.position.z = this.guiControls.lightZ
            this.renderer.render(this.scene,this.camera)
            // this.controls.update()//OrbitControls
            this.controls.update(this.clock.getDelta())//TrackballControls
            
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
            // rsTexture.flipY = false
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

                        // this.adjustModel(item)
                        // item.position.z = this.depth/2

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
        drawRSImageMap() {
            let rsTexture = new THREE.TextureLoader().load(
                '/images/rs/tongliaioL10c.png'
            )
            rsTexture.flipY = true
            rsTexture.generateMipmaps = true
            rsTexture.anisotropy= 4//使纹理斜着的时候不变模糊，沿纹理单元密度最高方向的轴线所取样本数，默认为1，通常为2的幂，越大越清晰，但需要更多的采样，为4时就比较清楚了
            // rsTexture.anisotropy= this.renderer.getMaxAnisotropy()//getMaxAnisotropy()找到GPU有效最大的anisotropy值，这个设备为16
            
            let rsMaterial = new THREE.MeshBasicMaterial({
                map: rsTexture,
                transparent: true,
                // side: THREE.DoubleSide,

            })
            const plane = new THREE.Mesh( new THREE.PlaneGeometry( 12, 12.6 ), rsMaterial);
            plane.position.z = this.depth + 0.01
            this.scene.add(plane)
        },
        createInnerGlowMaterial(feature) {
            let center = this.computeFeatureCenter(feature)

            // data.features.forEach((feature) => {
            //     feature.geometry.coordinates.forEach(coordinate => {
            //         coordinate.forEach(points => {
            //             let points_prj = []
            //             console.log(feature)
            //             console.log(coordinate)
            //             points.forEach(point => {
            //                 // let [x,y] 
            //                 points_prj.push(this.projection(point, this.center))
            //             })
            //             for(let i = 0; i < points.length; i++) {
            //                 debugger
            //             }

            //         })
                    
                    
            //     }) 
            // })
            
            let length = feature.geometry.coordinates.length
            console.log(length)
            for(let i = 0; i < length; i++){
                let points = feature.geometry.coordinates[i][0]
                let points_prj = []
                points.forEach(point => {
                    points_prj.push(this.projection(point, center))
                })
                feature.geometry.coordinates[i][0] = points_prj
            }
            console.log(feature)
            let xMax = Math.max(...coordinateList.map(item => { return item[0] }))
            let xMin = Math.min(...coordinateList.map(item => { return item[0] }))
            let yMax = Math.max(...coordinateList.map(item => { return item[1] }))
            let yMin = Math.min(...coordinateList.map(item => { return item[1] }))
            debugger
            
            let projection = d3.geoMercator().center(center).translate([0, 0]).reflectY(90)
            let path = d3.geo.path().projection(projection)
            var canvas = d3.select("body").append("canvas")
                .attr("width", 1200)
                .attr("height", 800);




                
        },
        async drawGlowMap() {
            const group = new THREE.Group()
            let features = await this.getData('data/kerqin.geojson')
            features.forEach(feature => {
                this.createInnerGlowMaterial(feature)
            })
            
            console.log(data)
            console.log(features)
            
            let material = this.createSpreadCircleMaterial()

            let rsTexture = new THREE.TextureLoader().load(
                '/images/kerqin.png'
            )
            // rsTexture.wrapS = THREE.RepeatWrapping
            // rsTexture.wrapT = THREE.RepeatWrapping
            rsTexture.flipY = true
            rsTexture.generateMipmaps = true
            rsTexture.anisotropy= 4//使纹理斜着的时候不变模糊，沿纹理单元密度最高方向的轴线所取样本数，默认为1，通常为2的幂，越大越清晰，但需要更多的采样，为4时就比较清楚了
            // rsTexture.anisotropy= this.renderer.getMaxAnisotropy()//getMaxAnisotropy()找到GPU有效最大的anisotropy值，这个设备为16
            let rsMaterial = new THREE.MeshBasicMaterial({
                map: rsTexture,
                transparent: true,
                opacity: 0.6
                // side: THREE.DoubleSide,
            })
            



            features.forEach((feature) => {
                feature.geometry.coordinates.forEach(coordinate => {
                    coordinate.forEach(points => {
                        let points_prj = []
                        points.forEach(point => {
                            // let [x,y] 
                            points_prj.push(this.projection(point, this.center))
                        })

                        let shape = this.drawShape(points_prj)
                        let geometry = new THREE.ShapeGeometry(shape)
                        
                        // let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
                        
                        let item = new THREE.Mesh(geometry, material)
                        item.label = feature.properties.name

                        item.position.z = this.depth + 0.01
                        // item.position.z = this.depth + 0.015
                        // item.position.x = item.position.x - this.offsetX
                        // item.position.y = item.position.y - this.offsetY

                        this.reMapUv(item.geometry)
                        // item.position.set(0,0,this.depth+0.01)

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

                        // let boxHelper;
                        // boxHelper = new THREE.BoxHelper( item, 0x000000 ); //显示包围盒
                        // this.scene.add(boxHelper)

                        group.add(item)
                    })
                    
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
        adjustModel(model) {
            model.traverse(function(o){
                if(o.isMesh) {
                    // o.geometry.computeBoundingBox()
                    o.geometry.center()
                }
            })
            if(model.geometry.attributes.uv) {//uv列表更新，线框不需要这个步骤
                let positionArray = model.geometry.getAttribute('position')
                let uvArray = []
                positionArray.array.forEach((item, index) => {
                    if((index+1)%3) {
                        uvArray.push(item)
                    }
                })
                uvArray = new Float32Array(uvArray)
                model.geometry.attributes.uv.array = uvArray
            }
            
            //调整模型位置至场景中心
            let bBox1 = new THREE.Box3()
            bBox1.setFromObject(model)
            let mLen = bBox1.max.x - bBox1.min.x
            let mWid = bBox1.max.z - bBox1.min.z
            let mHei = bBox1.max.y - bBox1.min.y
            let x = bBox1.min.x + mLen/2
            let y = bBox1.min.y + mHei/2
            let z = bBox1.min.z + mWid/2

            this.offsetX = model.position.x - (-x)
            this.offsetY = model.position.y - (-y)

            model.position.set(-x,-y,0)
        },
        computeFeatureCenter(feature) {
            let coordinateList = []
            feature.geometry.coordinates.forEach(coordinate => {
                coordinate.forEach(points => {
                    coordinateList.push(...points)
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
        createSpreadCircleMaterial(options) {
            // let color = options.color || new THREE.Color("rgb(255, 255, 255)")
            // let annulus_radius = 6
            // let width = 2
            
            let uniforms = {
                // offset: {
                //     type: 'f',
                //     value: 1.0
                // },
                glowColor: {
                    value: new THREE.Color('rgb(255,0,0)')
                },
                glowColorSize: {
                    value: 2.0
                }
                // radius: {
                //     value: annulus_radius
                // },
                // width: {
                //     value: width
                // }
            }
            this.uniforms = uniforms
            let vertexShader = `
                varying vec3 vPosition;
                // varying vec3 vNormal;
                // varying vec3 vUv;
                // uniform float offset;
                void main(){
                    vPosition=position;

                    // vNormal = normal;
                    gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `
            let fragmentShader = `
                varying vec3 vPosition;
                // varying vec3 vNormal;
                // uniform vec3 color;
                // uniform float radius;
                // uniform float width;

                /**
                * 获取指定角度方向，距离为xxx的像素的透明度
                *
                * @param angle 角度 [0.0, 360.0]
                * @param dist 距离 [0.0, 1.0]
                *
                * @return alpha [0.0, 1.0]
                */
                // float getColorAlpha(float angle, float dist) {
                //     // 角度转弧度，公式为：弧度 = 角度 * (pi / 180)
                //     // float radian = radians(angle); // 这个浮点数是 pi / 180
                //     float radian = radians(angle);
                //     vec4 color = getTextureColor(texture, v_uv0 + vec2(dist * cos(radian), dist * sin(radian))); 
                //     return color.a;
                // }
                // /**
                // * 获取指定距离的周边像素的透明度平均值
                // *
                // * @param dist 距离 [0.0, 1.0]
                // *
                // * @return average alpha [0.0, 1.0]
                // */
                // float getAverageAlpha(float dist) {
                //     float totalAlpha = 0.0;
                //     // 以30度为一个单位，那么「周边一圈」就由0到360度中共计12个点的组成
                //     totalAlpha += getColorAlpha(0.0, dist);
                //     totalAlpha += getColorAlpha(30.0, dist);
                //     totalAlpha += getColorAlpha(60.0, dist);
                //     totalAlpha += getColorAlpha(90.0, dist);
                //     totalAlpha += getColorAlpha(120.0, dist);
                //     totalAlpha += getColorAlpha(150.0, dist);
                //     totalAlpha += getColorAlpha(180.0, dist);
                //     totalAlpha += getColorAlpha(210.0, dist);
                //     totalAlpha += getColorAlpha(240.0, dist);
                //     totalAlpha += getColorAlpha(270.0, dist);
                //     totalAlpha += getColorAlpha(300.0, dist);
                //     totalAlpha += getColorAlpha(330.0, dist);
                //     return totalAlpha * 0.0833; // 1 / 12 = 0.08333
                // }
                // /**
                // * 获取发光的透明度
                // */
                // float getGlowAlpha() {
                //     // 如果发光宽度为0，直接返回0.0透明度，减少计算量
                //     if (glowColorSize == 0.0) {
                //         return 0.0;
                //     }

                //     // 将传入的指定距离，平均分成10圈，求出每一圈的平均透明度，
                //     // 然后求和取平均值，那么就可以得到该点的平均透明度
                //     float totalAlpha = 0.0;
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.1);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.2);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.3);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.4);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.5);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.6);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.7);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.8);
                //     totalAlpha += getAverageAlpha(glowColorSize * 0.9);
                //     totalAlpha += getAverageAlpha(glowColorSize * 1.0);
                //     return totalAlpha * 0.1;
                // }


                void main(){
                    
                    gl_FragColor = vec4(vPosition.x,vPosition.y,0.0,1.0);
                    // float alpha = getGlowAlpha();
                    // alpha = 1.0 - alpha;
      
                    // gl_FragColor = glowColor * alpha;

                }
            `

            const material = new THREE.ShaderMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                
            });
            return material
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
