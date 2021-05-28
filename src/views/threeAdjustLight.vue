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
        // this.offsetX = -110 //直接使用经纬度绘制时的位移
        // this.offsetY = -30
        this.depth = 0.2 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        this.initScene()
        this.addState()
        this.initControls()
        
        await this.drawMap()
        this.initLight()
        
        this.addClickListener()
        
        let GUI = document.querySelector('.dg.main.a')
        if(GUI) {
            GUI.remove()//不删除的话，每次保存时都会多出一个控制面板
        }
        this.initGUI()
        this.animate()
        
    },
    beforeDestroy() {
        console.log(this.myAnimate)
        cancelAnimationFrame(this.myAnimate)
        this.renderer = null
        this.scene = null
        this.camera = null
    },
    methods: {
        initGUI() {
            let guiControls = {
                lightX: -150,
                lightY: 20,
                lightZ: 0
            }
            this.guiControls = guiControls
            const gui = new dat.GUI()
            gui.add(guiControls,'lightX', -500, 500)
            gui.add(guiControls,'lightY', -500, 500)
            gui.add(guiControls,'lightZ', -500, 500)
            
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
            // scene.background = new THREE.Color('#1B464A')
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            // camera.position.set(0, 0, 50)//camera默认放在中心点(0,0,0)，挪一下位置
            camera.position.set(-2.2074636356036743, -13.61776549393699, 5.261517580471185)
            camera.up.set(0.16088540643481214, 0.9834879892160223, -0.12234075798377202)
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
            // controls.enableDamping = true
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
            dirLight.position.set(-20, 20, 0)
            //可以产生阴影
            dirLight.castShadow = true
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            
            dirLight.target = this.target
            console.log(dirLight.target)
            dirLight.shadow.camera.near = 10
            dirLight.shadow.camera.far = 200
            dirLight.shadow.camera.left = -10
            dirLight.shadow.camera.right = 10
            dirLight.shadow.camera.top = 10
            dirLight.shadow.camera.bottom = -10
            this.dirLight = dirLight
            this.scene.add(dirLight)
            //显示阴影
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
            this.dirLight.position.x = this.guiControls.lightX
            this.dirLight.position.y = this.guiControls.lightY
            this.dirLight.position.z = this.guiControls.lightZ
            this.renderer.render(this.scene,this.camera)
            // this.controls.update()
            this.controls.update(this.clock.getDelta())
            
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
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        },
        async getData(url){
            let data = await getPublicData(url)
            return data.features;
        },
        async drawMap() {
            const group = new THREE.Group()
            const lineGroup = new THREE.Group()
            let chinaGeometry = await this.getData('data/tongliao1.geojson')
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
                        this.adjustModel(item)
                        let lines = this.drawLine(points_prj)
                        lines.forEach(line => {
                            this.adjustModel(line)
                            lineGroup.add(line)
                        })
                        // console.log(item.geometry.boundingSphere.radius)
                        group.add(item)

                    })
                    
                }) 
            })
            this.target = group
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
        drawExtrude(shapeObj) {
            const extrudeSettings = {
                steps: 2,
                depth: this.depth,
                bevelEnabled: false
            }
            let geometry = new THREE.ExtrudeGeometry(shapeObj,extrudeSettings)
            let material1 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( '#161E32' ),
                specular: new THREE.Color('#334676'),
                // specular: 0x111111,
                shininess: 32.0
            })
            let material2 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( 'rgba(66,107,83,1)' ),
                specular: new THREE.Color('rgba(69,108,84,1)'),
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
            let lineMaterial = new THREE.LineBasicMaterial({ color: 0x008bfb })
            let line1 = new THREE.Line(geometry1, lineMaterial)
            let line2 = new THREE.Line(geometry2, lineMaterial)
            line1.name = 'line'
            line2.name = 'line'
            return [line1, line2]
        },
        projection(point) {
            const projection = d3.geoMercator().center([104.0, 37.5]).translate([0, 0]).reflectY(90)
            // const projection = d3.geoMercator().center([104.0, 37.5]).scale(10).translate([0, 0]).reflectY(90)
            return projection(point)

        },
        adjustModel(model) {
            //调整模型位置至场景中心
            let bBox = new THREE.Box3()
            bBox.setFromObject(model)
            let mLen = bBox.max.x - bBox.min.x
            let mWid = bBox.max.z - bBox.min.z
            let mHei = bBox.max.y - bBox.min.y
            let x = bBox.min.x + mLen/2
            let y = bBox.min.y + mHei/2
            let z = bBox.min.z + mWid/2
            model.position.set(-x,-y,0)
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
