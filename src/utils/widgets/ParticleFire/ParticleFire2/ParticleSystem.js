import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shader.js'
import LinearSpline from './LinearSpline.js'
import {SmokeOptions, FireOptions, SparkOptions, SmokeSpline, FireSpline, SparkSpline, Splines} from './ParticleType';

class ParticleSystem {
    constructor(params) {
        if(!params) {
            throw Error('Creating ParticleSystem instance must provide parameters')
        }
        this._camera = params.camera
        
        this._particles = []
        this._material = this._createMaterial()
        this._geometry = this._createGeometry()

        this._points = new THREE.Points(this._geometry, this._material)

        this.points = this._points

        this._createParamSpline()
    
        this._rateLimiter = 0.0;
        this._previousAnimate = null
        
        this._upadteGeometry()
    }
    _createMaterial() {
        const diffuseTexture = new THREE.TextureLoader().load('images/fire3.png')
        this._diffuseTexture = diffuseTexture
        const uniforms = {
            diffuseTexture: {
                value: diffuseTexture
            },
            pointMultiplier: {
                value: window.innerHeight/ (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            },
            resolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            },
            cameraNear: {
                value: this._camera.near
            },
            cameraFar: {
                value: this._camera.far
            },
            sizeFactor: {
                value: 1.0,
                type: 'f'
            },
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.CustomBlending,
            blendEquation: THREE.AddEquation,
            blendSrc: THREE.OneFactor,
            blendDst: THREE.OneMinusSrcAlphaFactor,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        })
        return material

    }
    _createGeometry() {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([],3))
        geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
        geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))
        geometry.setAttribute('blend', new THREE.Float32BufferAttribute([], 1))
        return geometry
    }
    _createParamSpline() {
        this._splines = {}
        Object.keys(Splines).forEach(key => {
            const alphaSpline = new LinearSpline(Splines[key].alphaTween)
            const colourSpline = new LinearSpline(Splines[key].colorTween)
            const sizeSpline = new LinearSpline(Splines[key].sizeTween)
            this._splines[key] = {
                alpha: alphaSpline,
                color: colourSpline,
                size: sizeSpline
            }
        })
    }
    _createParticle(options) {
        const lifeFactor = options.life
        const life = (Math.random() * 0.75 + 0.25) * lifeFactor;
        const sizeFactor = options.size
        const xVelocity = options.xVelocity * (Math.random() * 2.0 - 1.0)
        const yVelocity = options.yVelocity
        const zVelocity = options.zVelocity * (Math.random() * 2.0 - 1.0)
        const position = options.position
        const blend = options.blend
        const type = options.type
        return {
            position: new THREE.Vector3(
                (Math.random() * 2 - 1) * 4.0 + position[0],
                (Math.random() * 2 - 1) * 4.0 + position[1],
                (Math.random() * 2 - 1) * 4.0 + position[2]),
            size: (Math.random() * 0.5 + 0.5) * sizeFactor,
            colour: new THREE.Color(),
            alpha: 1.0,
            life: life,
            maxLife: life,
            rotation: Math.random() * 2.0 * Math.PI,
            velocity: new THREE.Vector3(xVelocity, yVelocity, zVelocity),
            blend: blend,
            type: type
        };
    }
    _addParticles(timeElapsed) {

        this._rateLimiter += timeElapsed;
        const n = Math.floor(this._rateLimiter * 100.0);
        this._rateLimiter -= n / 100.0;

        for (let i = 0; i < n; i++) {
            const p = this._createParticle(FireOptions);
            this._particles.push(p);
        }
        for (let i = 0; i < n; i++) {
            const p = this._createParticle(SmokeOptions);
            this._particles.push(p);
        }
        for (let i = 0; i < n * 2; i++) {
            const p = this._createParticle(SparkOptions);
            this._particles.push(p);
        }
    }
    _upadteGeometry() {
        const positions = []
        const sizes = []
        const colours = []
        const angles = []
        const blends = []

        // const box = new THREE.Box3()
        for(let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z)
            sizes.push(p.currentSize)
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
            angles.push(p.rotation)
            blends.push(p.blend)

            // box.expandByPoint(p.position)
        }
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this._geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
        this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
        this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))
        this._geometry.setAttribute('blend', new THREE.Float32BufferAttribute(blends, 1))
        this._geometry.attributes.position.needsUpdate = true
        this._geometry.attributes.size.needsUpdate = true
        this._geometry.attributes.colour.needsUpdate = true
        this._geometry.attributes.angle.needsUpdate = true
        this._geometry.attributes.blend.needsUpdate = true

        // this._geometry.boundingBox = box
        // this._geometry.boundingSphere = new THREE.Sphere()
        // box.getBoundingSphere(this._geometry.boundingSphere)
    }
    _updateParticles(timeElapsed) {
        for(let p of this._particles) {
            p.life -= timeElapsed
        }
        this._particles = this._particles.filter(p => {
            return p.life > 0.0
        })

        for(let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife

            p.rotation += timeElapsed * 0.5

            p.alpha = this._splines[p.type]['alpha'].get(t)
            p.currentSize = p.size * this._splines[p.type]['size'].get(t)
            p.colour.copy(this._splines[p.type]['color'].get(t))

            p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))

            const drag = p.velocity.clone()
            drag.multiplyScalar(timeElapsed * 0.1)
            drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
            drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
            drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
            p.velocity.sub(drag)
        }
        this._particles.sort( (a, b) => {
            const d1 = this._camera.position.distanceTo(a.position)
            const d2 = this._camera.position.distanceTo(b.position)

            if(d1 > d2) {
                return -1
            }
            if(d1 < d2) {
                return 1
            }
            return 0
        })

    }
    setScale(sizeFactor) {
        this._material.uniforms.sizeFactor.value = sizeFactor
        this._points.scale.set(sizeFactor,sizeFactor,sizeFactor)
    }
    setSize(sizeFactor) {
        this._material.uniforms.sizeFactor.value = sizeFactor
    }
    update(time) {
        this._material.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight)
        this._material.uniforms.cameraNear.value = this._camera.near
        this._material.uniforms.cameraFar.value = this._camera.far
        
        if(time) {
            if(this._previousAnimate === null) {
                this._previousAnimate = time
            }
            this._timeElapsed = (time - this._previousAnimate) / 1000
            this._addParticles(this._timeElapsed)
            this._updateParticles(this._timeElapsed)
            this._upadteGeometry()

            this._previousAnimate = time
        }

        this.id = requestAnimationFrame(this.update.bind(this))
    }
    stop() {
        cancelAnimationFrame(this.id)
    }
    destroy() {
        this.stop()
        this.points.parent.remove(this.mesh)
        this._material.dispose()
        this._geometry.dispose()
        this._diffuseTexture.dispose()
    }
}

export default ParticleSystem