export class Obstacle {
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
        this.c.fillStyle = "cyan"
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