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
import CanvasFlowline from '@/utils/widgets/CanvasFlowline/CanvasFlowline.js'

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
        
        this.initScene()
        this.addState()
        this.initControls()
        this.initLight()

        this.addTerrain()
        this.addDistrictLine()
        this.addGroundElements()
        this.test()
        
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
            // renderer.sortObject = false
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
            

            TWEEN.update()
            this.outCircle.rotation.z += 0.01
            this.inCircle.rotation.z -= 0.005
            this.drawOther(this.ctx, this.drawOptions)
            this.canvasFlowline.draw(this.ctx)
            this.canvasFlowline.next()
            this.texture.needsUpdate = true
            

            
        },
        onWindowResize() {
            // this.composer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
        },
        test() {
            const canvas = document.createElement('canvas')
            // const lineLength = 34
            // const lineWidth = 14
            // const hGap = 40
            // const vGap = 60
            // const fontSize = 40
            const drawOptions = {
                canvas: canvas,
                lineLength: 50,
                lineWidth: 14,
                hGap: 40,
                vGap: 100,
                fontSize: 68
            }
            const lineWidth = drawOptions.lineWidth
            this.drawOptions = drawOptions
            canvas.height = 150
            canvas.width = drawOptions.hGap*2 + drawOptions.fontSize*4

            const ctx = canvas.getContext('2d')
            
            // document.body.appendChild(canvas)

            const canvasFlowline = new CanvasFlowline(['255,255,255,0.1',
                '255,255,255,0.8','255,255,255,0.1'], 
                canvas.width/2, 14, 8, 
                [{x:lineWidth,y:lineWidth},{x:canvas.width-lineWidth,y:lineWidth},{x:canvas.width-lineWidth,y:canvas.height-lineWidth},{x:lineWidth,y:canvas.height-lineWidth}],
                0)
            this.canvasFlowline = canvasFlowline
            this.ctx = ctx

            const texture = new THREE.CanvasTexture(canvas)
            this.texture = texture
            const material = new THREE.SpriteMaterial({map: texture, transparent: true})
            const spirte = new THREE.Sprite(material)
            spirte.scale.set(8,8*canvas.height/canvas.width)
            spirte.center.set(0,0)
            spirte.position.set(0,18,0)
            this.scene.add(spirte)

            

            //pole
            const poleGeometry = new THREE.CylinderGeometry(0.1,0.1,6,32)
            const poleMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5
            })
            const pole = new THREE.Mesh(poleGeometry, poleMaterial)
            pole.position.y =15
            pole.renderOrder =1
            this.scene.add(pole)

            //bottomShpere
            const bShpereGeometry = new THREE.SphereGeometry(0.6,32,16,0,Math.PI*2,0,Math.PI/2)
            const bShpereMaterial = new THREE.MeshLambertMaterial({
                // color: 0x3ED5EB,
                color: 0x319FB0,
                transparent: true,
                opacity: 0.5,

            })
            const bottomShpere = new THREE.Mesh(bShpereGeometry,bShpereMaterial)
            bottomShpere.position.y = 12
            bottomShpere.renderOrder = 2
            this.scene.add(bottomShpere)
            //bottomCircle
            const bCircleGeometry = new THREE.CircleGeometry(1.0,32)
            const bCircleMaterial = new THREE.MeshBasicMaterial({
                color: 0x3ED5EB,
                transparent: true,
                opacity: 0.5,
            })
            const bottomCircle = new THREE.Mesh(bCircleGeometry,bCircleMaterial)
            bottomCircle.position.y = 12.1
            bottomCircle.rotation.x = -Math.PI/2
            bottomCircle.renderOrder = 3
            this.scene.add(bottomCircle)

            const gradientRingGeometry1 = new THREE.RingGeometry(1.4,1.6,32)
            const uniforms = {
                color: {
                    value: new THREE.Color(0x3ED5EB)
                },
                radius: {
                    value: 1.6
                },
                direction: {
                    value: true
                },
                thetaLength: {
                    value: 280.0
                },
                theta0: {
                    value: 0.0
                },
                openEnd: {
                    value: false
                },
                opacity: {
                    value: 0.9
                }
            }
            const vertexShader = `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `
            const fragmentShader = `
                #define M_PI 3.1415926535897932384626433832795

                uniform vec3 color;
                uniform float radius;
                uniform float thetaLength;
                uniform float theta0;
                uniform bool direction;
                uniform bool openEnd;
                uniform float opacity;

                varying vec3 vPosition;

                float movingSector(vec2 position, vec2 center, float radius) {
                    float r = distance(position, center);
                    // if(r < radius) {
                    vec2 d = normalize(position - center);
                    float radianLength = thetaLength;
                    float theta;
                    if(!openEnd) {
                        radianLength = clamp(thetaLength + 60.0, 0.0, 360.0);
                    }
                    if(direction) {
                        theta = mod(atan(d.y, d.x)*180.0/M_PI + theta0, 360.0);
                        
                    }else {
                        theta = mod(theta0 - atan(d.y, d.x)*180.0/M_PI, 360.0);
                    }
                    float gradient = clamp(1.0 - theta/radianLength, 0.0, 1.0);
                    if(!openEnd) {
                        if(theta > thetaLength) {
                            gradient = 0.0;
                        }
                    }
                    return opacity*gradient;
                        
                    // } else {
                    //     return 0.0;
                    // }
                }
                void main() {
                    float alpha;
                    vec2 center = vec2(0.0, 0.0);
                    alpha = movingSector(vPosition.xy,center,radius);
                    gl_FragColor = vec4(color,alpha);
                }
            `
            const gradientRingMaterial1 = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true
            })
            const gradientRing1 = new THREE.Mesh(gradientRingGeometry1,gradientRingMaterial1)
            gradientRing1.rotation.x = -Math.PI/2
            gradientRing1.position.y = 12.1
            this.scene.add(gradientRing1)

            

            const gradientRingGeometry2 = new THREE.RingGeometry(1.7,2.3,32)
            const uniforms2 = {
                color: {
                    value: new THREE.Color(0x3ED5EB)
                },
                radius: {
                    value: 2.3
                },
                direction: {
                    value: false
                },
                thetaLength: {
                    value: 250.0
                },
                theta0: {
                    value: 0.0
                },
                openEnd: {
                    value: true
                },
                opacity: {
                    value: 0.6
                }
            }

            const gradientRingMaterial2 = new THREE.ShaderMaterial({
                uniforms: uniforms2,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                opacity: 0.3
            })
            const gradientRing2 = new THREE.Mesh(gradientRingGeometry2,gradientRingMaterial2)
            gradientRing2.rotation.x = -Math.PI/2
            gradientRing2.position.y = 12.1
            this.scene.add(gradientRing2)
            
            const tween = new TWEEN.Tween({theta: 0})
                .to({theta: 360},3000)
                .onUpdate(({theta}) => {
                    gradientRingMaterial1.uniforms.theta0.value = theta
                    gradientRingMaterial2.uniforms.theta0.value = theta
                })
                .repeat(Infinity)
                .start()
            
            const uniforms3 = {
                radius0: {
                    value: 5
                },
                radius: {
                    value: 0.2
                },
                color: {
                    value: new THREE.Color(0x3ED5EB)
                }
            }
            const vertexShader3 = `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `
            const fragmentShader3 = `
                uniform float radius0;
                uniform float radius;
                uniform vec3 color;

                varying vec3 vPosition;
                void main() {
                    vec2 center = vec2(0.0, 0.0);
                    float d = distance(center, vPosition.xy);
                    float pct = d/radius0;
                    float width = radius/7.0;
                    float alpha = 0.0;
                    
                    if(d < radius && d > radius - width) {
                        alpha = -1.0/radius0*radius + 1.0;
                    }
                    gl_FragColor = vec4(color,alpha);
                }

            `
            const spreadRingGeometry = new THREE.CircleGeometry(5,50)
            const spreadRingMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms3,
                vertexShader: vertexShader3,
                fragmentShader: fragmentShader3,
                transparent: true
            })
            const spreadRing = new THREE.Mesh(spreadRingGeometry,spreadRingMaterial)
            spreadRing.rotation.x = -Math.PI/2
            spreadRing.position.y = 12
            this.scene.add(spreadRing)
            const tween1 = new TWEEN.Tween(spreadRingMaterial.uniforms.radius)
                .to({value:5.0},3000)
                .easing(TWEEN.Easing.Cubic.Out)
                .repeat(Infinity)
                .start()
            
            const group = new THREE.Group()
            group.add(spirte, pole, bottomShpere, bottomCircle, gradientRing1, gradientRing2, spreadRing)
            group.scale.set(2,2,2)
            this.scene.add(group)
        },
        drawOther(ctx, options) {
            const canvas = options.canvas
            const lineLength = options.lineLength
            const lineWidth = options.lineWidth
            const hGap = options.hGap
            const vGap = options.vGap
            const fontSize = options.fontSize

            
            // ctx.fillStyle = 'rgba(0,0,0,1)';
            // ctx.fillStyle = 'rgba(0,0,0,0)';
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#F8EB00"
            ctx.beginPath()
            ctx.moveTo(0,lineLength)
            ctx.lineTo(0,0)
            ctx.lineTo(lineLength,0)
            ctx.moveTo(canvas.width-lineLength,0)
            ctx.lineTo(canvas.width,0)
            ctx.lineTo(canvas.width,lineLength)
            ctx.moveTo(canvas.width,canvas.height-lineLength)
            ctx.lineTo(canvas.width,canvas.height)
            ctx.lineTo(canvas.width-lineLength,canvas.height)
            ctx.moveTo(lineLength, canvas.height)
            ctx.lineTo(0,canvas.height)
            ctx.lineTo(0, canvas.height-lineLength)
            ctx.lineWidth = lineWidth
            ctx.stroke()
            ctx.fillStyle = "rgba(0.5,0.5,0.5,0.5)"
            ctx.fillRect(lineWidth,lineWidth,canvas.width-lineWidth*2,canvas.height-lineWidth*2)
            ctx.font = fontSize+"px bold 微软雅黑"
            ctx.fillStyle = "#F8EB00"
            ctx.fillText("三个粒子", hGap,vGap)

            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.moveTo(lineWidth,canvas.height-lineWidth)
            ctx.lineTo(lineWidth+30,canvas.height-lineWidth)
            ctx.lineTo(lineWidth,canvas.height-lineWidth-30)
            ctx.closePath()
            ctx.fill()
        },
        addGroundElements() {
            const floorGeometry = new THREE.PlaneGeometry(1000,1000)
            const floorTexture = new THREE.TextureLoader().load('images/tourism/floor.png')
            floorTexture.wrapS = THREE.RepeatWrapping
            floorTexture.wrapT = THREE.RepeatWrapping
            floorTexture.repeat = new THREE.Vector2(40,40)
            const floorMaterial = new THREE.MeshBasicMaterial({
                map: floorTexture,
                // color: 0xffffff
            })
            const floor = new THREE.Mesh(floorGeometry, floorMaterial)
            floor.rotation.x = -Math.PI/2
            floor.position.set(0,-0.1,0)
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
            this.scene.add(outCircle)
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
            this.scene.add(inCircle)

            
        },
        addTerrain() {
            const heightTexture = new THREE.TextureLoader().load('images/rs/beijing_dem.png')
            const diffuseTexture = new THREE.TextureLoader().load('images/rs/beijing_satellite.png')
            const options =  {
                width: 100,
                height: 100,
                depth: 1,
                heightRatio: 1,
                heightTexture: heightTexture,
                diffuseTexture: diffuseTexture
            }
            const terrain = new DistrictTerrain(options).mesh
            terrain.rotation.x = -Math.PI/2
            this.scene.add(terrain)

            console.log(terrain)
            const terrainTween = new TWEEN.Tween({scale: 0})
                .to({scale: 5}, 3000)
                .onUpdate(({scale}) => {
                    terrain.scale.set(1,1,scale)
                    terrain.position.y = options.depth*scale
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
