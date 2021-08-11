<template>
    <div class="three-view">
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import {getPublicData} from "@/api/requestData.js";

import * as THREE from "three"
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'

import * as TWEEN from "@tweenjs/tween.js"

import HeatMap from "@/utils/widgets/ThreeHeatmap/3DHeatmap.js"
// const h337 = require("heatmap.js")

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
        this.depth = 0.5 //拉伸地图的厚度
        this.clock = new THREE.Clock()
        
        this.initScene()
        this.addState()
        this.initControls()

        this.createHeatmap()
        
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
        console.log('AAAAAAAAAAAA')
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
            scene.background = new THREE.Color(0xffffeb)
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({canvas,antialias: true, alpha: true})
            this.renderer = renderer
            renderer.shadowMap.enabled = true;
            renderer.autoClear = false;
            //PerspectiveCamera(fov:Number 视野角度, aspect:Number 横纵比, near:Number 近面, far:Number远面) 透视摄像机
            const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight,0.1,2000)
            this.camera = camera
            
            //调整camera视角
            camera.position.set(0, 30, 60)

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
            controls.rotateSpeed = 2.0
            controls.zoomSpeed = 2.0
            controls.panSpeed = 1.0
            this.controls = controls
        },
        animate() {//three需要动画循环函数，每一帧都执行这个函数
            this.renderer.render(this.scene,this.camera)
            
            this.controls.update(this.clock.getDelta())//TrackballControls

            TWEEN.update()
            
            this.state.update();
            this.myAnimate = requestAnimationFrame(this.animate);
        },
        onWindowResize() {
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        async getData(url) {
            let data = await getPublicData(url)
            return data.features;
        },
        createHeatmap() {
            let length = 100
            const points = []
            while(length--) {
                const val = Math.floor(Math.random()*10)
                const point = {
                    x: Math.floor(Math.random()*500),
                    y: Math.floor(Math.random()*500),
                    value: val
                }
                points.push(point)
            }
            console.log(points)
            const options = {
                data: points,
                heightRatio: 5.0,
                width: 50,
                height: 50
            }

            const heatmap = new HeatMap(options)
            console.log(heatmap.mesh)
            heatmap.mesh.rotation.x = -Math.PI/2
            this.scene.add(heatmap.mesh)
            const gridHelper = new THREE.GridHelper(50,25)
            this.scene.add(gridHelper)
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
