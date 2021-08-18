/**
 * Create cropping canvas element
 * @param {String} cvsID ID of canvas tag
 * @param {String} cm Cutting method (r: rectangle || c: circle)
 * @param {Object} object ow, oh: output width and height of rectangle method | r: output radius of circle method
 */
function CroppingCanvas(cvsID, cm, { ow, oh, r }) {
  const cvs = document.getElementById(cvsID)
  if (!cvs || cvs.tagName.toLowerCase() !== 'canvas') {
    throw `CroppingCanvasError: Canvas is not exist => canvas ID: ${csvID}`
  }

  // Validate params of cutting method
  const validateCutMethod = (cm, ow, oh, r) => {
    if (cm !== 'r' && cm !== 'c') {
      throw `CroppingCanvasError: Cutting method ${cm} is not available`
    }
  
    if (cm === 'c' && (isNaN(r) || r <= 0)) {
      throw `CroppingCanvasError: Radius of the shape must be positive => r: ${r}`
    }
  
    if (cm === 'r' && (isNaN(ow) || ow <= 0 || isNaN(oh) || oh <= 0)) {
      throw `CroppingCanvasError: Width and height of the shape must be positive => ow: ${ow} | oh: ${oh}`
    }
  }

  validateCutMethod(cm, ow, oh, r)
  const { cw, ch } = { cw: cvs.width, ch: cvs.height }

  // Center coordinates
  let { ix, iy } = { ix: 0, iy: 0 }

  // Scale ratio
  let v = 1.0

  // canvas dragging flag
  let mouseDown = false
  let { sx, sy } = { sx: 0, sy: 0 }

  const img = new Image()

  // Image loaded
  img.onload = (_ev) => {
    img.crossOrigin = 'anonymous'
    ix = img.width/2
    iy = img.height/2
    let scl = parseInt(100 * cw/img.width)
    scaling(scl)
  }

  // Load image
  const previewImage = (_url) => {
    img.src = _url
  }

  // Change scale
  scaling = (_v) => {
    v = parseInt(_v) * 0.01
    drawCanvas(ix, iy)
  }

  // Update image, re-draw the canvas
  drawCanvas = (_x, _y) => {
    const ctx = cvs.getContext('2d')
    const { iw, ih } = { iw: img.width, ih: img.height }
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.fillRect(0, 0, cw, ch)
    ctx.drawImage(img, 0, 0, iw, ih, cw/2 - _x*v, ch/2 - _y*v, iw*v, ih*v)
    ctx.strokeStyle = 'rgba(200, 0, 0, 0.5)'

    if (cm === 'r') ctx.strokeRect((cw-ow)/2, (ch-oh)/2, ow, oh)
    if (cm === 'c') ctx.arc(cw/2, ch/2, r, 0, 2*Math.PI)
    ctx.stroke();
  }

  // canvas drag start position
  cvs.ontouchstart =
  cvs.onmousedown = (_ev) => {
    mouseDown = true
    sx = _ev.pageX
    sy = _ev.pageY
    return false
  }

  // canvas drag end position
  cvs.ontouchend =
  cvs.onmouseout =
  cvs.onmouseup = (_ev) => {
    if (!mouseDown) return
    mouseDown = false
    drawCanvas(ix += (sx - _ev.pageX) / v, iy += (sy - _ev.pageY) / v)
    return false
  }

  // canvas dragging
  cvs.ontouchmove =
  cvs.onmousemove = (_ev) => {
    if (!mouseDown) return
    drawCanvas(ix + (sx - _ev.pageX) / v, iy + (sy - _ev.pageY) / v)
    return false
  }

  // canvas wheel
  cvs.onmousewheel = (_ev) => {
    let scl = parseInt(v * 100 + _ev.wheelDelta * 0.05)
    if (scl < 10) scl = 10
    if (scl > 400) scl = 400
    scaling(scl)
    return false
  }

  /**
   * Change the cutting method of canvas cropping
   * @param {String} _cm The cutting method ('r' | 'c')
   * @param {Number} _ow The output width to rectangle method 
   * @param {Number} _oh The output height to rectangle method 
   * @param {Number} _r The output radius to circle method
   */
  CroppingCanvas.prototype.changeCuttingMethod = (_cm, _ow, _oh, _r ) => {
    validateCutMethod(_cm, _ow, _oh, _r)
    cm = _cm
    ow = _ow
    oh = _oh
    r = _r
    drawCanvas(ix, iy)
  }

  /**
   * Change the image of canvas cropping
   * @param {String} url Specifies the path to the image
   */
  CroppingCanvas.prototype.loadImage = (url) => {
    previewImage(url)
  }

  /**
   * Crop canvas, return image path and output canvas element
   */
  CroppingCanvas.prototype.cropImage = () => {
    const { iw, ih } = { iw: img.width, ih: img.height }
    const out = document.createElement('canvas')
    // Set width and height of output canvas
    out.width = out.height = 2*r
    if (cm === 'r') {
      out.width = ow
      out.height = oh
    }
    const { w, h } = { w: out.width, h: out.height }
    const ctx = out.getContext('2d')

    // If cutting method is circle, set the outer border to circle
    if (cm === 'c') {
      ctx.arc(w/2, h/2, h/2, 0, 2 * Math.PI, true)
      ctx.clip()
    }
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.fillRect( 0, 0, w, h )
    ctx.drawImage(img, 0, 0, iw, ih, w/2 - ix*v, h/2 - iy*v, iw*v, ih*v)

    return {
      path: out.toDataURL('images/png'),
      canvas: out
    }
  }
}
