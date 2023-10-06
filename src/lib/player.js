export class Player {
    /**
     * 
     * @param {CanvasRenderingContext2D} c
     * @param {number} x 
     * @param {number} y 
     * @param {number} w
     * @param {number} h 
     */
	constructor(c, x, y, w, h) {
		this.c = c
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}
	draw() {
		this.c.beginPath()
		this.c.fillStyle = "black"
		this.c.rect(this.x, this.y, this.w, this.h)
		this.c.fill()
	}
    /**
     * 
     * @param {number} ease 
     * @param {number} playery
     * @param {number} distance
     * @param {idle} jump
     * @param {boolean} idle
     */
	update(ease, playery, distance, jump, idle) {
		if (!idle) {
			if(jump) { // jump
				this.y = playery-(distance*ease)
			} else { // false
				this.y = (playery-distance)+(distance*ease)
			}
		} else {
			this.y = playery
		}
		
	}
}