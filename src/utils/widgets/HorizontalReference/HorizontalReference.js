/**
 * The horizontal location of an origin relative to an object.
 *
 * @enum {Number}
 */
var HorizontalReferece = {
  /**
   * The origin is at the horizontal center of the object.
   *
   * @type {Number}
   * @constant
   */
  CENTER: 0,

  /**
   * The origin is on the left side of the object.
   *
   * @type {Number}
   * @constant
   */
  LEFT: 1,

  /**
   * The origin is on the right side of the object.
   *
   * @type {Number}
   * @constant
   */
  RIGHT: -1
};
export default Object.freeze(HorizontalReferece);
