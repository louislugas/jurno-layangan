export class Bonus {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {CanvasRenderingContext2D} context
     * @param {number} vw 
     * @param {number} vh 
     * @param {number} index
     */
    constructor(context, x, y, vw, vh, index) {
        this.c = context
        this.x = x
        this.y = y
        this.vw = vw
        this.vh = vh
        this.i = index
        this.w = 0
        this.type = ""
        this.img = new Image()
        this.sx = 0
        this.sw = 0
        this.sh = 0
        this.topY = 0
    }

    draw() {
        let s = this.vh/9
        this.w = s*1.78
        if (this.i % 3 == 0) {
            this.img.src = "/images/obstacle_1.svg"
            this.sw = 856/4
            this.sh = 258.057
            this.type="bon-1"
            this.topY = this.y
            this.w = s*1.78
            this.c.strokeStyle = "black"
            this.c.beginPath()
            this.c.rect(this.x, this.y, s*0.5, s*0.5)
            this.c.stroke()
            this.c.fillStyle = "black"
            this.c.font = "bold 20px Courier New black"
            this.c.fillText(this.i.toString() + " Bonus-1", this.x, this.y)
            // this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y, s*1.78, s*2.15)
        } else if (this.i % 2 == 0) {
            this.img.src = "/images/obstacle_2.svg"
            this.sw = 458.058/4
            this.sh = 226.198
            this.type="bon-2"
            this.topY = this.y + s*0.265
            this.w = s*0.87
            this.c.strokeStyle = "black"
            this.c.beginPath()
            this.c.rect(this.x, this.y, s*0.5, s*0.5)
            this.c.stroke()
            this.c.fillStyle = "black"
            this.c.font = "bold 20px Courier New black"
            this.c.fillText(this.i.toString() + " Bonus-2", this.x, this.y)
            // this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y + s*0.265, s*0.87, s*1.885)
        } else if (this.i % 5 == 0) {
            this.img.src = "/images/obstacle_3.svg"
            this.sw = 112.594
            this.sh = 229.061
            this.type="bon-3"
            this.topY = this.y + s*0.24
            this.w = s*0.93
            this.c.strokeStyle = "black"
            this.c.beginPath()
            this.c.rect(this.x, this.y, s*0.5, s*0.5)
            this.c.stroke()
            this.c.fillStyle = "black"
            this.c.font = "bold 20px Courier New black"
            this.c.fillText(this.i.toString() + " Bonus-3", this.x, this.y)
            // this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y + s*0.24, s*0.93, s*1.91)
        } else {
            this.type="obs-4"
            this.topY = this.y + s*1.455
            this.w = s*0.5
            this.c.strokeStyle = "black"
            this.c.beginPath()
            this.c.rect(this.x, this.y, s*0.5, s*0.5)
            this.c.stroke()
            this.c.fillStyle = "black"
            this.c.font = "bold 20px Courier New black"
            this.c.fillText(this.i.toString() + " Bonus-4", this.x, this.y)
        }
    }
    /**
     * 
     * @param {number} speed 
     * @param {number} frame
     */
    update(speed, frame) {
        if (this.i % 3 == 0) {
            if(frame % 12 == 0) {
                if(this.sx < this.sw*3) {
                    this.sx+=this.sw
                } else {
                    this.sx = 0
                }
            }
        } else if (this.i % 2 == 0) {
            if(frame % 12 == 0) {
                if(this.sx < this.sw*3) {
                    this.sx+=this.sw
                } else {
                    this.sx = 0
                }
            }
        }
        this.x-=speed
    }
}