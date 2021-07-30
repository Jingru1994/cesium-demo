<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import {getPublicData} from "@/api/requestData.js";

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { SceneUtils } from 'three/examples/jsm/utils/SceneUtils.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import Popup from '@/utils/widgets/Popup1/Popup.js'

export default ({
    name: "ThreeMap",
    data() {
        return {
        }
    },
    created() {
    },
    async mounted() {
        console.log(this)
        this.initScene()
        this.addState()
        // this.initControls()//因为要添加labelRenderer，所以得在labelRenderer初始化后再给其添加control
        await this.drawMap()
        this.initLight()
        this.addPickObject()
        
        
        this.animate()
        
    },
    beforeDestroy() {
        cancelAnimationFrame(this.animate)
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
        console.log('AAAAAAAAAAAA')
    },
    methods: {
        initScene() {
            const scene = new THREE.Scene()
            this.scene = scene
            scene.background = new THREE.Color('#041336')
            // scene.fog = new THREE.Fog( 0xa0a0a0 , 300, 500);
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            camera.position.set(0, 0, 100)//camera默认放在中心点(0,0,0)，挪一下位置

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
            const controls = new OrbitControls(this.camera, renderer.domElement)
            this.controls = controls
            controls.enableDamping = true
        },
        initLight() {
            this.initAmbientLight()
            this.initPointLight()
            // this.initDirectionalLight()
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
            dirLight.position.set(0, 0, 100)
            //可以产生阴影
            dirLight.castShadow = true
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
            console.log(dirLight.target)
            dirLight.shadow.camera.near = 100
            dirLight.shadow.camera.far = 300
            dirLight.shadow.camera.left = -40
            dirLight.shadow.camera.right = 40
            dirLight.shadow.camera.top = 40
            dirLight.shadow.camera.bottom = -50
            this.scene.add(dirLight)
            //显示阴影
            const debugCamera = new THREE.CameraHelper(dirLight.shadow.camera)
            this.scene.add(debugCamera)
        },
        initPointLight() {
            const pointLight = new THREE.PointLight( 0xffffff, 0.5, 200 );
            pointLight.position.set( 0, 0, 150 );
            this.scene.add(pointLight)
            // 显示阴影
            // const debugCamera = new THREE.CameraHelper(pointLight.shadow.camera)
            // this.scene.add(debugCamera)
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
            this.controls.update()
            // trackballControls.update(clock.getDelta());
            this.renderer.render(this.scene,this.camera)
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
        async getData(url){
            let data = await getPublicData(url)
            return data.features;
        },
        async drawMap() {
            const group = new THREE.Group()
            const lineGroup = new THREE.Group()
            let chinaGeometry = await this.getData('data/china.json')
            let offsetX = 110
            let offsetY = 30
            let i = 0
            chinaGeometry.forEach((province) => {
                console.log('i:'+i)
                console.log(province)
                i++
                province.geometry.coordinates.forEach(provinceChild => {
                    provinceChild.forEach(point => {
                        let item = this.drawExtrude(this.drawShape(point,offsetX,offsetY))
                        item.label = province.properties.name
                        let lines = this.drawLine(point,offsetX,offsetY)
                        lines.forEach(line => {
                            lineGroup.add(line)
                        })
                        // console.log(item.geometry.boundingSphere.radius)
                        group.add(item)

                    })
                    
                }) 
            })
            group.scale.y = 1.2
            lineGroup.scale.y = 1.2;
            // group.rotation.x = - Math.PI / 2
            // lineGroup.rotation.x = - Math.PI / 2
            this.scene.add(group)
            this.scene.add(lineGroup)
            this.group = group
            console.log(this.group)
            this.lineGroup = lineGroup
        },
        drawShape(posArr,offsetX,offsetY) {
            var shape = new THREE.Shape()
            shape.moveTo(posArr[0][0]-offsetX, posArr[0][1]-offsetY)
            posArr.forEach(item => {
                shape.lineTo(item[0]-offsetX, item[1]-offsetY)
            })
            return shape
        },
        drawExtrude(shapeObj) {
            const extrudeSettings = {
                steps: 2,
                depth: 1,
                bevelEnabled: false
            }
            let geometry = new THREE.ExtrudeGeometry(shapeObj,extrudeSettings)
            let material1 = new THREE.MeshPhongMaterial({
                color: new THREE.Color( '#161E32' ),
                specular: new THREE.Color('#334676'),
                // specular: 0x111111,
                shininess: 32.0
            })
            let material2 = new THREE.MeshBasicMaterial({
                color: 0x008bfb
            })
            let shapeGeometryObj = new THREE.Mesh(geometry, [material1, material2])
            // shapeGeometryObj.position = geometry.boundingSphere.center
            // let shapeGeometryObj = new THREE.Mesh(geometry, material1)
            shapeGeometryObj.name = 'board'
            return shapeGeometryObj
        },
        drawLine(posArr,offsetX,offsetY) {
            let geometry1 = new THREE.BufferGeometry()
            let geometry2 = new THREE.BufferGeometry()
            let verticesList1 = []
            let verticesList2 = []
            posArr.forEach(item => {
                verticesList1.push(item[0]-offsetX)
                verticesList1.push(item[1]-offsetY)
                verticesList1.push(1.001)
                verticesList2.push(item[0]-offsetX)
                verticesList2.push(item[1]-offsetY)
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
        addPickObject() {
            const that = this
            const raycaster = new THREE.Raycaster()
            let selectedObject
            const container = document.querySelector('.three-view')
            let popup = new Popup(this.scene,this.camera,container)
            console.log(popup)
            let labelRenderer = popup.getCSS2DRenderer()
            this.initControls(labelRenderer)
            // this.renderer.domElement.addEventListener('mousemove',onPointerMove)
            labelRenderer.domElement.addEventListener('mousemove',onPointerMove)
            function onPointerMove(event) {
                let mouse = new THREE.Vector2();
                if ( event.isPrimary === false ) return;
                mouse.x = (event.clientX/window.innerWidth)*2 - 1
                mouse.y = -(event.clientY/window.innerHeight)*2 + 1
                
                raycaster.setFromCamera(mouse,that.camera)
                const intersects = raycaster.intersectObject(that.group,true)
                
                if(intersects.length > 0) {
                    if(selectedObject && selectedObject !== intersects[0].object) {
                        selectedObject.material[0].color.set(selectedObject.currentColor)
                    }
                    if(!selectedObject || selectedObject !== intersects[0].object) {
                        selectedObject = intersects[0].object
                        selectedObject.currentColor = selectedObject.material[0].color.getStyle()
                        selectedObject.material[0].color.set("#0077D9")
                        // selectedObject.position.set(selectedObject.geometry.boundingSphere.center)
                        popup.addTo(selectedObject)
                    }
                }else {
                    if(selectedObject) {
                        selectedObject.material[0].color.set(selectedObject.currentColor)
                        popup.removeFrom(selectedObject)
                    }
                    
                    selectedObject = null
                }
            }
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
