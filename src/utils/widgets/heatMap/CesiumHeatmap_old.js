import WebMercatorProjection from "cesium/Core/WebMercatorProjection.js";
import Rectangle from "cesium/Core/Rectangle.js";
import Color from "cesium/Core/Color.js";
import Entity from "cesium/DataSources/Entity.js";
import ImageMaterialProperty from "cesium/DataSources/ImageMaterialProperty.js";
import CesiumMath from "cesium/Core/Math.js";
import Cartesian3 from "cesium/Core/Cartesian3.js";
import Cartographic from "cesium/Core/Cartographic.js";
import h337 from "heatmap.js";

const DEF_OPTS = {
	maxOpacity: 0.6, // the maximum opacity used if not given in the heatmap options object
	minOpacity: 0.1, // the minimum opacity used if not given in the heatmap options object
	blur: 0.85, // the blur used if not given in the heatmap options object
	radius: 25,
	// backgroundColor: 'rgba(0,0,0,.95)',
	gradient: {
		'0.4': 'blue',
		'0.6': 'green',
		'0.8': 'yellow',
		'0.9': 'red'
	},
	maxCanvasSize: 2500,
	minCanvasSize: 2000,
}
 
class HeatLayer{
	constructor(viewer,options) {
		this._options = {
			...DEF_OPTS,
			...options,
			
		}
		this._viewer = viewer
		this._heat = undefined
		this._bounds = undefined
		this._scale = 1
		this._positions = []
		this._options.spacing = this._options.radius * 1.5
		this._entity = new Entity()
		// this._state = State.INITIALIZED
	}
 
	get options() {
		return this._options
	}

	_transformWGS84ToMercator(position) {
		let WMP = new WebMercatorProjection();
		let mp = WMP.project(
			Cartographic.fromDegrees(position.lng, position.lat, 0)
		);
		position.lng = mp.x;
		position.lat = mp.y;
		return position;
  	}
	_transformMercatorToWGS84(position) {
		let WMP = new WebMercatorProjection();
		let mp = WMP.unproject(
			new Cartesian3(position.lng, position.lat, 0)
		)
		position.lng = CesiumMath.toDegrees(mp.longitude);
		position.lat = CesiumMath.toDegrees(mp.latitude);
		return position;
	}
 
	_transformWGS84ToHeatmap(position) {
		let coord = {}
		coord.x = Math.round(
			(position.lng - this._bounds.west) / this._scale + this._options.spacing
		)
		coord.y = Math.round(
			(position.lat - this._bounds.south) / this._scale + this._options.spacing
		)
		coord.y = this._heat._renderer.canvas.height - coord.y
		return coord
	}

	_initCanvas() {
		let diffLng = Math.abs(this._bounds.east - this._bounds.west)
		let diffLat = Math.abs(this._bounds.north - this._bounds.south)
		let max = Math.max(diffLng, diffLat)
		let min = Math.min(diffLng, diffLat)
		let scale = 1
		let space = this._options.spacing;
		if (max > this._options.maxCanvasSize + 2*space) {
			scale = max / (this._options.maxCanvasSize + 2*space)
			if (min / scale < (this._options.minCanvasSize + 2*space)) {
				scale = min / (this._options.minCanvasSize + 2*space)
			}
		} else if (min < (this._options.minCanvasSize + 2*space)) {
			scale = min / (this._options.minCanvasSize + 2*space)
			if (max / scale > (this._options.maxCanvasSize + 2*space)) {
				scale = max / (this._options.maxCanvasSize + 2*space)
			}
		}
		this._scale = scale
		if (!this._options.container) {
			let container = document.createElement("div");
			container.style.display = 'none'
			document.getElementById("app").appendChild(container);
			this._options.container = container;
		}
		this._options.container.style.height = diffLat / this._scale + 2*this._options.spacing + "px";
		this._options.container.style.width = diffLng / this._scale + 2*this._options.spacing + "px";
		if (!this._heat) {
			this._heat = h337.create(this._options)
		} else {
			this._heat.configure(this._options)
		}
	}
 
	_initEntity(entity1) {
		let entity = entity1
		let offset = this._options.spacing * this._scale
		this._bounds.west -= offset,
		this._bounds.south -= offset,
		this._bounds.east += offset,
		this._bounds.north += offset
		let bounds = Rectangle.fromDegrees(
			this._bounds.west,
			this._bounds.south,
			this._bounds.east,
			this._bounds.north
		)
		entity.show = false
		entity.rectangle = {
		coordinates: bounds,
		fill: false,
	//    distanceDisplayCondition: this._options.distanceDisplayCondition
		}
	}

 
	_draw() {
		/** set bounds */
		if (!this._bounds) {
			return false
		}

		this._initCanvas()
		
		let data = []
		this._positions.forEach(item => {
			let coord = this._transformWGS84ToHeatmap({
				lng: item.lng || item.x,
				lat: item.lat || item.y
			})
			data.push({
				x: coord.x,
				y: coord.y,
				value: item.value || 1
			})
		})
		this._heat.setData({
			min: 0,
			max: 1,
			data
		})
		this._initEntity(this._entity)
		this._viewer.entities.add(this._entity);
		let material = new ImageMaterialProperty({
			image: this._heat._renderer.canvas,
			transparent: true
		})
		
		Object.assign(this._entity.rectangle,{
			fill: true,
			material: material
		});
		// this._entity.rectangle.fill = true;
		// this._entity.rectangle.outline = true;
		// this._entity.rectangle.material = material;
		//  this._entity.rectangle.material = Color.WHITE;
		this._entity.show = true
	}
	_redraw() {
		/** set bounds */
		if (!this._bounds) {
			return false
		}
		this._initCanvas()
		let data = []
		this._positions.forEach(item => {
			let coord = this._transformWGS84ToHeatmap({
				lng: item.lng || item.x,
				lat: item.lat || item.y
			})
			data.push({
				x: coord.x,
				y: coord.y,
				value: item.value || 1
			})
		})
		this._heat.setData({
			min: 0,
			max: 1,
			data
		})
		this._initEntity(this._nextEntity)
		
		let material = new ImageMaterialProperty({
			image: this._heat._renderer.canvas,
			transparent: true
		})
		
		Object.assign(this._nextEntity.rectangle,{
			fill: true,
			material: material
		});
		// this._entity.rectangle.fill = true;
		// this._entity.rectangle.outline = true;
		// this._entity.rectangle.material = material;
		// this._entity.rectangle.material = Color.WHITE;
		
		this._nextEntity.show = true
		this._entity.show = false
		console.log(this._nextEntity);
		console.log(this._entity);
		[this._nextEntity, this._entity] = [this._entity, this._nextEntity]
		

		// const that = this
		// setTimeout(function(){
		// 	that._entity.show = false
		// 	console.log(that._nextEntity);
		// 	console.log(that._entity);
		// 	[that._nextEntity, that._entity] = [that._entity, that._nextEntity]

		// },100);
	}

	_getBounds(positions = [], expand = 0) {
		let minLng = 180
		let minLat = 90
		let maxLng = -180
		let maxLat = -90
		positions.forEach(item => {
			minLng = Math.min(minLng, item.lng || item.x)
			minLat = Math.min(minLat, item.lat || item.y)
			maxLng = Math.max(maxLng, item.lng || item.x)
			maxLat = Math.max(maxLat, item.lat || item.y)
		})
		//获取最值的另一种方法
		// minLng = Math.min(...positions.map(function(item) {return item.x || item.lng}));
		// maxLng = Math.max(...positions.map(function(item) {return item.x || item.lng}));
		// minLat = Math.min(...positions.map(function(item) {return item.y || item.lat}));
		// maxLat = Math.max(...positions.map(function(item) {return item.y || item.lat}));

		if (expand > 0) {
			let diffLng = Math.abs(maxLng - maxLng)
			let diffLat = Math.abs(maxLat - minLat)
			minLng -= diffLng * expand
			minLat -= diffLat * expand
			maxLng += diffLng * expand
			maxLat += diffLat * expand
		}
		return {
			west: minLng,
			south: minLat,
			east: maxLng,
			north: maxLat
		}
	}

	

	setPosition(positions) {
		if (!positions || !Array.isArray(positions)) {
			return this
		}
		this._positions = positions
		this._bounds = this._getBounds(this._positions)
		this._draw()
		return this
	}

	changePositions(positions) {
		if (!positions || !Array.isArray(positions)) {
			return this
		}
		if (!this._heat) {
			return this
		}
		if(!this._nextEntity) {
			this._nextEntity = new Entity();
			this._viewer.entities.add(this._nextEntity);
		}
		this._positions = positions
		this._bounds = this._getBounds(this._positions);
		this._redraw();
		
		//直接切换material的方式，也会闪烁，相对redraw来说不能改变entity的位置大小
		// let data = []
		// this._positions.forEach(item => {
		// 	let coord = this._transformWGS84ToHeatmap({
		// 		lng: item.lng || item.x,
		// 		lat: item.lat || item.y
		// 	})
		// 	data.push({
		// 		x: coord.x,
		// 		y: coord.y,
		// 		value: item.value || 1
		// 	})
		// })
		// this._heat.setData({
		// 	min: 0,
		// 	max: 1,
		// 	data
		// })
		// let material = new ImageMaterialProperty({
		// 	image: this._heat._renderer.canvas,
		// 	transparent: true
		// })
		// this._entity.rectangle.material = material;
		return this
	}
 

	setOptions(options) {
		//  Util.merge(this._options, options)
		this._options = {
			...this._options,
			...options,
		
		}
		if (this._heat) {
			this._options.spacing = this._options.radius * 1.5
			this._heat.configure(this._options)
		}
		return this
	}

	remove() {
		if(this._entity) {
			this._viewer.entities.remove(this._entity)
		}
	}
	show() {
		if(this._entity) {
			this._entity.show = true
		}
	}
	hide() {
		if(this._entity) {
			this._entity.show = false
		}
	}
}
 
export default HeatLayer
 