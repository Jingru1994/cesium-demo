import * as THREE from 'three'
import { vertexShader, fragmentShader } from './shader.js'
import LinearSpline from './LinearSpline.js'

class ParticleSystem {
    constructor(params) {
        if(!params) {
            throw Error('Creating ParticleSystem instance must provide parameters')
        }
        this._camera = params.camera
        this._depthTexture = params.depthTexture
        
        this._options = params.options
        
        this._particles = []
        this._material = this._CreateMaterial(params)
        this._geometry = this._CreateGeometry()

        this._points = new THREE.Points(this._geometry, this._material)
        this.points = this._points
        this._CreateParamSpline(params)

        this._quantityFactor = params.options.quantityFactor
        this._rateLimiter = 0.0;
        this._previousAnimate = null

        this._UpadteGeometry()
    }
    _CreateMaterial(params) {
        const diffuseTexture = params.options.diffuseTexture || new THREE.TextureLoader().load('images/fire3.png')
        this._texture = diffuseTexture
        const uniforms = {
            diffuseTexture: {
                value: diffuseTexture
            },
            depthTexture: {
                value: null
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
            }
        }

        const blendAttribute = ['blending', 'blendEquation', 'blendSrc', 'blendDst']
        const blendOptions = {}
        Object.entries(params.options).forEach(item => {
            if(blendAttribute.includes(item[0])) {
                blendOptions[item[0]] = item[1]
            }
        })

        const options = {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        }
        Object.assign(options,blendOptions)

        const material = new THREE.ShaderMaterial(options)
        return material
    }

    _CreateGeometry() {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([],3))
        geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
        geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
        geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))
        return geometry

    }

    _CreateParamSpline(params) {
        const alphaLegend = params.options.alphaLegend
        const colourLegend = params.options.colourLegend
        const sizeLegend = params.options.sizeLegend
        this._alphaSpline = new LinearSpline(alphaLegend)
        this._colourSpline = new LinearSpline(colourLegend)
        this._sizeSpline = new LinearSpline(sizeLegend)
    }

    _CreateParticle() {
        const lifeFactor = this._options.life
        const life = (Math.random() * 0.75 + 0.25) * lifeFactor;
        const sizeFactor = this._options.size
        const xVelocity = this._options.xVelocity * (Math.random() * 2.0 - 1.0)
        const yVelocity = this._options.yVelocity
        const zVelocity = this._options.zVelocity * (Math.random() * 2.0 - 1.0)
        return {
            position: new THREE.Vector3(
                (Math.random() * 2 - 1) * 4.0,
                (Math.random() * 2 - 1) * 4.0,
                (Math.random() * 2 - 1) * 4.0),
            size: (Math.random() * 0.5 + 0.5) * sizeFactor,
            colour: new THREE.Color(),
            alpha: 1.0,
            life: life,
            maxLife: life,
            rotation: Math.random() * 2.0 * Math.PI,
            velocity: new THREE.Vector3(xVelocity, yVelocity, zVelocity),
        };
    }

    _AddParticles(timeElapsed) {

        this._rateLimiter += timeElapsed;
        const n = Math.floor(this._rateLimiter * 100.0);
        this._rateLimiter -= n / 100.0;

        for (let i = 0; i < n * this._quantityFactor; i++) {
            const p = this._CreateParticle();
            this._particles.push(p);
        }
    }

    _UpadteGeometry() {
        const positions = []
        const sizes = []
        const colours = []
        const angles = []
        
        for(let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z)
            sizes.push(p.currentSize)
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
            angles.push(p.rotation)
        }
        this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this._geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
        this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
        this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))
        this._geometry.attributes.position.needsUpdate = true
        this._geometry.attributes.size.needsUpdate = true
        this._geometry.attributes.colour.needsUpdate = true
        this._geometry.attributes.angle.needsUpdate = true
    }

    _UpdateParticles(timeElapsed) {
        for(let p of this._particles) {
            p.life -= timeElapsed
        }
        this._particles = this._particles.filter(p => {
            return p.life > 0.0
        })

        for(let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife

            p.rotation += timeElapsed * 0.5

            p.alpha = this._alphaSpline.get(t)
            p.currentSize = p.size * this._sizeSpline.get(t)
            p.colour.copy(this._colourSpline.get(t))

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
        this._material.uniforms.depthTexture.value = this._depthTexture
        this._material.uniforms.cameraNear.value = this._camera.near
        this._material.uniforms.cameraFar.value = this._camera.far
        
        if(time) {
            if(this._previousAnimate === null) {
                this._previousAnimate = time
            }
            this._timeElapsed = (time - this._previousAnimate) / 1000
            this._AddParticles(this._timeElapsed)
            this._UpdateParticles(this._timeElapsed)
            this._UpadteGeometry()

            this._previousAnimate = time
        }

        this.id = requestAnimationFrame(this.update.bind(this))
    }
    stop() {
        cancelAnimationFrame(this.id)
    }
    destroy() {
        this.stop()
        this.points.parent.remove(this.points)
        this._material.dispose()
        this._geometry.dispose()
        this._texture.dispose()
    }
}

export default ParticleSystem