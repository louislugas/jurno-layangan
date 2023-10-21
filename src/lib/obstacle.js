export class Obstacle {
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
            this.type="obs-1"
            this.topY = this.y
            this.w = s*1.78
            // this.c.strokeStyle = "black"
            // this.c.beginPath()
            // this.c.rect(this.x, this.y, s*1.78, s*2.15)
            // this.c.stroke()
            // this.c.fillStyle = "black"
            // this.c.font = "bold 20px Courier New black"
            // this.c.fillText(this.i.toString() + " obs-1", this.x, this.y)
            this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y, s*1.78, s*2.15)
        } else if (this.i % 2 == 0) {
            this.img.src = "/images/obstacle_2.svg"
            this.sw = 458.058/4
            this.sh = 226.198
            this.type="obs-2"
            this.topY = this.y + s*0.265
            this.w = s*0.87
            // this.c.strokeStyle = "black"
            // this.c.beginPath()
            // this.c.rect(this.x, this.y + s*0.265, s*0.87, s*1.885)
            // this.c.stroke()
            // this.c.fillStyle = "black"
            // this.c.font = "bold 20px Courier New black"
            // this.c.fillText(this.i.toString() + " obs-2", this.x, this.y + s*0.265)
            this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y + s*0.265, s*0.87, s*1.885)
        } else if (this.i % 5 == 0) {
            this.img.src = "/images/obstacle_3.svg"
            this.sw = 112.594
            this.sh = 229.061
            this.type="obs-3"
            this.topY = this.y + s*0.24
            this.w = s*0.93
            // this.c.strokeStyle = "black"
            // this.c.beginPath()
            // this.c.rect(this.x, this.y + s*0.24, s*0.93, s*1.91)
            // this.c.stroke()
            // this.c.fillStyle = "black"
            // this.c.font = "bold 20px Courier New black"
            // this.c.fillText(this.i.toString() + " obs-3", this.x, this.y+ s*0.24)
            this.c.drawImage(this.img, this.sx, 0, this.sw, this.sh, this.x, this.y + s*0.24, s*0.93, s*1.91)
        } else {
            this.type="obs-4"
            this.topY = this.y + s*1.455
            this.w = s*0.5
            // this.c.strokeStyle = "black"
            // this.c.beginPath()
            // this.c.rect(this.x, this.y + s*1.455, s*0.5, s*0.695)
            // this.c.stroke()
            // this.c.fillStyle = "black"
            // this.c.font = "bold 20px Courier New black"
            // this.c.fillText(this.i.toString() + " obs-4", this.x, this.y + s*1.455)
            let a = new Cone(this.c, this.x, this.y + s*1.455, this.vw, this.vh, this.i)
            a.draw()
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

class Cone {
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
    }

    draw() {
        let s = this.vh/9
        this.c.fillStyle = "#F57F20"
        this.c.beginPath()
        this.c.moveTo(this.x+s*0.196, this.y);
        this.c.lineTo(this.x+s*0.304, this.y);
        this.c.lineTo(this.x+s*0.435, this.y+s*0.641);
        this.c.lineTo(this.x+s*0.065, this.y+s*0.641);
        this.c.closePath();
        this.c.fill()

        this.c.fillStyle = "#f0efef"
        this.c.beginPath()
        this.c.moveTo(this.x+s*0.170, this.y+s*0.127);
        this.c.lineTo(this.x+s*0.330, this.y+s*0.127);
        this.c.lineTo(this.x+s*0.363, this.y+s*0.288);
        this.c.lineTo(this.x+s*0.137, this.y+s*0.288);
        this.c.closePath();
        this.c.fill()

        this.c.fillStyle = "#f0efef"
        this.c.beginPath()
        this.c.moveTo(this.x+s*0.113, this.y+s*0.408);
        this.c.lineTo(this.x+s*0.387, this.y+s*0.408);
        this.c.lineTo(this.x+s*0.420, this.y+s*0.569);
        this.c.lineTo(this.x+s*0.079, this.y+s*0.569);
        this.c.closePath();
        this.c.fill()

        this.c.fillStyle = "#f26921"
        this.c.beginPath()
        this.c.roundRect(this.x, this.y+s*0.64, s*0.5, s*0.05, s*0.025)
        this.c.fill()

        
    }
    /**
     * 
     * @param {number} speed 
     */
    update(speed) {
        this.x-=speed
    }
}