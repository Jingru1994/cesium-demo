/**
 * Represents the height type that the position relative to.
 *
 * @enum {Number}
 */
 var HeightType = {
    /**
     * The position is absolute.
     * @type {Number}
     * @constant
     */
    NONE: 0,

    /**
     * The position is clamped to the terrain.
     * @type {Number}
     * @constant
     */
    TERRAIN: 1,
  
    /**
     * The position is clamped to the 3dtiles.
     * @type {Number}
     * @constant
     */
    TILES: 2,

    /**
     * The position height is the height above the terrain.
     * @type {Number}
     * @constant
     */
    RELATIVE_TO_TERRAIN: 3,

     /**
     * The position height is the height above the 3dtiles.
     * @type {Number}
     * @constant
     */
    RELATIVE_TO_TILES: 4,
  };
  export default Object.freeze(HeightType);