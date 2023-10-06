export class Ground {
    /**
     * 
     * @param {number} vWidth 
     * @param {number} vHeight 
     * @param {CanvasRenderingContext2D} context
     * @param {number} y 
     * @param {number} h 
     */
    constructor(context, y, h, vWidth, vHeight) {
        this.c = context
        this.vw = vWidth
        this.vh = vHeight
        this.y = y
        this.h = h
    }
    
    draw() {
        this.c.fillStyle = "blue"
        this.c.beginPath()
        this.c.rect(0, this.y, this.vw, this.vh/3)
        this.c.fill()
    }
    /**
     * 
     * @param {number} uvWidth
     * @param {number} uvHeight 
     */
    update(uvWidth, uvHeight) {
        this.vw = uvWidth
        this.vh = uvHeight
    }
}

export class NearBackground {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} context
     * @param {number} w 
     * @param {number} h 
     * @param {number} index
     */
    constructor(context, x, y, w, h, index) {
        this.c = context
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.i = index
    }

    draw() {
        this.c.fillStyle = "red"
        this.c.beginPath()
        this.c.rect(this.x, this.y, this.w, this.h)
        this.c.fill()
        this.c.fillStyle = "black"
        this.c.font = "bold 40px black"
        this.c.fillText(this.i.toString(), this.x, this.y)
    }
    /**
     * 
     * @param {number} speed 
     */
    update(speed) {
        this.x-=speed
    }
}

export class FarBackground {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} context
     * @param {number} w 
     * @param {number} h 
     * @param {number} index
     */
    constructor(context, x, y, w, h, index) {
        this.c = context
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.i = index
    }

    draw() {
        this.c.fillStyle = "grey"
        this.c.beginPath()
        this.c.rect(this.x, this.y, this.w, this.h)
        this.c.fill()
        this.c.strokeStyle = "black"
        this.c.beginPath()
        this.c.rect(this.x, this.y, this.w, this.h)
        this.c.fill()
        this.c.fillStyle = "black"
        this.c.font = "bold 40px black"
        this.c.fillText(this.i.toString(), this.x, this.y+100)
    }
    /**
     * 
     * @param {number} speed 
     */
    update(speed) {
        this.x-=speed
    }
}