import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import './popup.css'

class Popup {
    label
    #labelRenderer
    #scene
    #camera
    #labelPanel

    constructor(scene,camera,dom,text) {
        this.#scene = scene
        this.#camera = camera
        const labelDiv = document.createElement( 'div' )
        labelDiv.className = 'three-popup-label'
        const label = new CSS2DObject( labelDiv )
        this.label = label
                
        const labelPanel = document.createElement( 'div' );
        labelPanel.className = 'three-popup-label-panel'
        this.labelPanel = labelPanel
        const labelBottom = document.createElement( 'div' );
        labelBottom.className = 'three-popup-label-bottom'
        label.element.appendChild(labelPanel)
        label.element.appendChild(labelBottom)

        let labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        console.log(dom)
        dom.appendChild( labelRenderer.domElement );
        this.#labelRenderer = labelRenderer
        this.animate()
        
    }
    getCSS2DRenderer() {
        return this.#labelRenderer
    }
    addTo(object) {
        this.labelPanel.textContent = object.label
        let position = object.geometry.boundingSphere.center
        this.label.position.x = position.x
        this.label.position.y = position.y
        this.label.position.z = position.z + 1.5
        object.add(this.label)
    }
    removeFrom(object) {
        object.remove(this.label)
    }
    
    animate() {
        requestAnimationFrame( this.animate.bind(this) )
        this.#labelRenderer.render( this.#scene, this.#camera );
    }
}

export default Popup