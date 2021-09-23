/**
 * The vertical location of an origin relative to an object.
 * @enum {Number}
 *
 */
 var VerticalReference = {
    /**
     * The origin is at the vertical center between <code>BASELINE</code> and <code>TOP</code>.
     *
     * @type {Number}
     * @constant
     */
    CENTER: 0,
  
    /**
     * The origin is at the bottom of the object.
     *
     * @type {Number}
     * @constant
     */
    BOTTOM: 1,
  
    /**
     * The origin is at the top of the object.
     *
     * @type {Number}
     * @constant
     */
    TOP: -1,
  };
  export default Object.freeze(VerticalReference);