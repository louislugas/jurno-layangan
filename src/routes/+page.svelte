<script>
	import BezierEasing from 'bezier-easing'
	import {onMount} from 'svelte'
	import { tap, composedGesture, press, scroll, pan } from 'svelte-gestures';
	import {scaleLinear} from 'd3'
	import supabase from '$lib/db'
	import {skyColor, sunColor, starColor, cloudColor, textColor, buildColor} from '$lib/skyColor'
	import {obstacleCoordinate} from '$lib/obstacle'
	import {kiteData} from '$lib/kiteData'
	import Fa from 'svelte-fa/src/fa.svelte'
	import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons'
	import DeviceDetector from "svelte-device-detector";

	let inputName, inputForm, leaderBoard, inputtext, inputbutton
	let bodySection
	let show = false
	let submitToast

	async function getData() {
		let { data } = await supabase
			.from('kitescore')
			.select('name, score')
		leaderBoard = data
    }

	async function insertData() {
		if (inputName != null) {
			// inputtext.disabled = true
			// inputbutton.disabled = true
		
			let { error } = await supabase
				.from("kitescore")
				.insert({name: inputName, score: score})
			
		} else {
			window.alert("Isi nama dengan handle twittermu!")
		}
		
	}

	const updateLeaderBoard = supabase.channel('score')

    updateLeaderBoard
        .on(
            'postgres_changes',
            {
                event:"INSERT",
                schema:"public",
                table:"kitescore",
            },
            async (payload) => {
				if (payload.new.name == inputName && payload.new.score == score) {
					submitToast.style.opacity = 1
					setTimeout(() => {
						submitToast.style.opacity = 0
					}, 2000)
				}
                await getData()
            }
        ).subscribe()

	// const easingUp = BezierEasing(0.61, 1, 0.88, 1) //easeOutSine
	// const easingDn = BezierEasing(0.12, 0, 0.39, 0) //easeInSine 

	// const easingUp = BezierEasing(0.22, 1, 0.36, 1) //easeOutQuint
	// const easingDn = BezierEasing(0.64, 0, 0.78, 0) //easeInQuint

	const easingUp = BezierEasing(0, 0.55, 0.45, 1) //easeOutCirc
	const easingDn = BezierEasing(0.55, 0, 1, 0.45) //easeInCirc

	let clientw, clienth
	let w = 300, h = 400
	let pw = 40, ph = 40
	let animId, moveId
	let canvas, playerKite, cloud = [[],[]], star = [[],[]], c, lineKite, buildBg
	let up = false
	let height
	let speed = 10
	let startJump, newHeight, startFall
	let score = 0
	let duration = 400
	let lifewidth = w
	let kitePosY
	let scaleX
	let kitePosX = 3, targetKitePos
	let lose = false
	let direction
	let start = false
	let scoreText, timerText
	let lifeMultiplier
	let kiteSelect = 0

	let stars = [[], []]
	let clouds = [[], []]

	let dialog1, dialog2, dialog3
	let skyContainer
	let startTimer = 3
	// let debugHeight = [], debug = []
	let level = 1
	let levelArray= [5, 2, 1]
	let tails = []
	let offset = 0
	let timerInterval
	let distr, distg, distb, r,g, b, cR, cG, cB
	let distrBuild, distgBuild, distbBuild, rBuilding, gBuilding, bBuilding
	let distrStar, distgStar, distbStar, rStar, gStar, bStar
	let distrCloud, distgCloud, distbCloud, rCloud, gCloud, bCloud
	let distrText, distgText, distbText, rText, gText, bText
	let distrSun, distgSun, distbSun, rSun, gSun, bSun
	let levelDivider = 5000
	let heightLevel = 0
	let starSwitch = 0
	let obsSpeed = 2
	let obstacles = []
	let frameCount = 0
	let popScore
	let hitScore

	let bgAudio
	let audioPlay = true

	let kiteAvatar, obsAvatar

	function toggleSound() {
		audioPlay = !audioPlay
		if (!audioPlay) {
			bgAudio.pause()
			bgAudio.currentTime = 0
		}
	}

	onMount(async() => {
		dialog1.showModal()

		bgAudio = new Audio()
		bgAudio.src = "audio/layangan_bg_music.wav"
		bgAudio.loop = true

		await getData()	

		//////////////
		r = skyColor[level-1][0]
		g = skyColor[level-1][1]
		b = skyColor[level-1][2]

		distr = skyColor[level][0]-r
		distg = skyColor[level][1]-g
		distb = skyColor[level][2]-b
		
		skyContainer.style.backgroundColor = `rgb(${r},${g},${b})`

		// build color
		rBuilding = buildColor[level-1][0]
		gBuilding = buildColor[level-1][1]
		bBuilding = buildColor[level-1][2]

		distrBuild = buildColor[level][0]-rBuilding
		distgBuild = buildColor[level][1]-gBuilding
		distbBuild = buildColor[level][2]-bBuilding

		// star color
		rStar = starColor[level-1][0]
		gStar = starColor[level-1][1]
		bStar = starColor[level-1][2]

		distrStar = starColor[level][0]-rStar
		distgStar = starColor[level][1]-gStar
		distbStar = starColor[level][2]-bStar

		// text color
		rText = textColor[level-1][0]
		gText = textColor[level-1][1]
		bText = textColor[level-1][2]

		distrText = textColor[level][0]-rText
		distgText = textColor[level][1]-gText
		distbText = textColor[level][2]-bText

		// cloud color
		rCloud = cloudColor[level-1][0]
		gCloud = cloudColor[level-1][1]
		bCloud = cloudColor[level-1][2]

		distrCloud = cloudColor[level][0]-rCloud
		distgCloud = cloudColor[level][1]-gCloud
		distbCloud = cloudColor[level][2]-bCloud

		// sun color
		rSun = sunColor[level-1][0]
		gSun = sunColor[level-1][1]
		bSun = sunColor[level-1][2]

		distrSun = sunColor[level][0]-rSun
		distgSun = sunColor[level][1]-gSun
		distbSun = sunColor[level][2]-bSun

		canvas.width = clientw
		canvas.height = clienth
		w = clientw
		h = clienth
		lifewidth = clientw
		scaleX = scaleLinear().domain([0,6]).range([0,clientw])
		lifeMultiplier = clientw / 300
		pw = pw * lifeMultiplier
		ph = ph * lifeMultiplier
		height = clienth/2 - ph
		kitePosY = (clienth-ph)-height

		//populate stars
		populateStarsClouds(stars, 0 ,20, 0, 2)
		populateStarsClouds(stars, 1, 40, 2500, 2)

		//populate clouds
		populateStarsClouds(clouds, 0, 200, 0, 1)
		populateStarsClouds(clouds, 1, 200, 25000, 2)

		c = canvas.getContext("2d")

		obstacleCoordinate.forEach((d, i) => {
			obstacles[i] = new Obstacle(c,d.y, obsSpeed)
			obstacles[i].draw()
		})

		// buildBg = new Building(c, rBuilding, gBuilding, bBuilding)
		// buildBg.draw()

		kiteAvatar = new Image()
		kiteAvatar.src = kiteData[0].img

		obsAvatar = new Image()
		obsAvatar.src = "/images/obs.png"
		
		playerKite = new Player(c, scaleX(kitePosX)-(pw/2),kitePosY, pw, ph)
		playerKite.draw()

		lineKite = new Tali(c, clientw/3,clienth , scaleX(kitePosX), kitePosY+ph/2 )
		lineKite.draw()

		scoreText = new Score(c, rText, gText, bText)
		scoreText.draw()

		timerText = new Timer(c)
		timerText.draw()

		clouds.forEach((d,i) => {
			d.forEach((d,j) => {
				cloud[i][j] = new Cloud(c, scaleX(d.x),d.y, rCloud, gCloud, bCloud)
				cloud[i][j].draw()
			})
		})

		stars.forEach((d,i) => {
			d.forEach((d,j) => {
				star[i][j] = new Star(c, scaleX(d.x), d.y, 20,  rStar, gStar, bStar, i)
				star[i][j].draw()
			})
		})
		////////////////
	})

	function populateStarsClouds(arr, index, n, h, multiplier) {
		for(let i=0;i<n;i++) {
			let r = Math.round(Math.random()*multiplier)// *levelArray[level-1] // add later
			if (r != 0) {
				arr[index][i] = {
					x:Math.round(Math.random() * 4 + 1),
					y:i*125+h
				}
			} else {
				arr[index][i] = {
					x:10,
					y:i*125+h
				}
			}
		}
	}

	function nextIntro() {
		dialog1.close()
		dialog1.style.display="none"
		dialog2.style.display="flex"
		dialog2.showModal()
	}

	function chooseKite(e) {
		kiteSelect = e.target.dataset.index

		kiteAvatar = new Image()
		kiteAvatar.src = kiteData[kiteSelect].img

		obsAvatar = new Image()
		obsAvatar.src = "/images/obs.png"
	}

	function startGame() {

		if (audioPlay) {
			bgAudio.play()
		}

		dialog2.close()
		dialog2.style.display="none"
		
		tails = []

		show = true

		animId = window.requestAnimationFrame(animateStart)

		timerInterval = setInterval(() => {
			startTimer--
		}, 1000)
		setTimeout(() => {
			clearInterval(timerInterval)
			animId = window.requestAnimationFrame(animateFall)
			start = true
		},3000)
		
	}

	function restartGame() {
		// console.log("restart")
		lose = false

		bgAudio.pause()

		if (audioPlay) {
			bgAudio.play()
		}

		dialog3.close()
		dialog3.style.display="none"

		tails = []

		// reset all stats
		level = 1
		score = 0
		heightLevel = 0
		startTimer = 3
		height = clienth/2 - ph
		kitePosY = (clienth-ph)-height

		r = skyColor[level-1][0]
		g = skyColor[level-1][1]
		b = skyColor[level-1][2]

		distr = skyColor[level][0]-r
		distg = skyColor[level][1]-g
		distb = skyColor[level][2]-b

		skyContainer.style.backgroundColor = `rgb(${r},${g},${b})`

		// build color
		rBuilding = buildColor[level-1][0]
		gBuilding = buildColor[level-1][1]
		bBuilding = buildColor[level-1][2]

		distrBuild = buildColor[level][0]-rBuilding
		distgBuild = buildColor[level][1]-gBuilding
		distbBuild = buildColor[level][2]-bBuilding

		// star color
		rStar = starColor[level-1][0]
		gStar = starColor[level-1][1]
		bStar = starColor[level-1][2]

		distrStar = starColor[level][0]-rStar
		distgStar = starColor[level][1]-gStar
		distbStar = starColor[level][2]-bStar

		// text color
		rText = textColor[level-1][0]
		gText = textColor[level-1][1]
		bText = textColor[level-1][2]

		distrText = textColor[level][0]-rText
		distgText = textColor[level][1]-gText
		distbText = textColor[level][2]-bText

		// cloud color
		rCloud = cloudColor[level-1][0]
		gCloud = cloudColor[level-1][1]
		bCloud = cloudColor[level-1][2]

		distrCloud = cloudColor[level][0]-rCloud
		distgCloud = cloudColor[level][1]-gCloud
		distbCloud = cloudColor[level][2]-bCloud

		// sun color
		rSun = sunColor[level-1][0]
		gSun = sunColor[level-1][1]
		bSun = sunColor[level-1][2]

		distrSun = sunColor[level][0]-rSun
		distgSun = sunColor[level][1]-gSun
		distbSun = sunColor[level][2]-bSun

		//populate stars
		populateStarsClouds(stars, 0 ,20, 0)
		populateStarsClouds(stars, 1, 40, 2500)

		//populate clouds
		populateStarsClouds(clouds, 0, 200, 0, 1)
		populateStarsClouds(clouds, 1, 200, 25000, 2)

		obstacleCoordinate.forEach((d, i) => {
			obstacles[i] = new Obstacle(c,d.y, obsSpeed)
			obstacles[i].draw()
		})

		// buildBg = new Building(c, rBuilding, gBuilding, bBuilding)
		// buildBg.draw()

		kiteAvatar = new Image()
		kiteAvatar.src = kiteData[kiteSelect].img

		obsAvatar = new Image()
		obsAvatar.src = "/images/obs.png"

		playerKite = new Player(c, scaleX(kitePosX)-(pw/2),kitePosY, pw, ph)
		playerKite.draw()

		lineKite = new Tali(c, clientw/3,clienth , scaleX(kitePosX), kitePosY+ph/2 )
		lineKite.draw()

		scoreText = new Score(c, rText, gText, bText)
		scoreText.draw()

		timerText = new Timer(c)
		timerText.draw()

		clouds.forEach((d,i) => {
			d.forEach((d,j) => {
				cloud[i][j] = new Cloud(c,scaleX(d.x),d.y, rCloud, gCloud, bCloud)
				cloud[i][j].draw()
			})
		})

		stars.forEach((d,i) => {
			d.forEach((d,j) => {
				star[i][j] = new Star(c, scaleX(d.x), d.y, 20,  rStar, gStar, bStar, i)
				star[i][j].draw()
			})
		})

		// debugHeight.forEach((d,i) => {
		// 	debug[i] = new Height(c, d.height, d.height*level, i)
		// 	debug[i].draw()
		// })

		animId = window.requestAnimationFrame(animateStart)

		timerInterval = setInterval(() => {
			startTimer--
		}, 1000)
		setTimeout(() => {
			clearInterval(timerInterval)
			animId = window.requestAnimationFrame(animateFall)
			start = true
		},3000)
	}

	function animateStart() {
		c.clearRect(0,0,canvas.width, canvas.height)
		cloud.forEach((c) => {
			c.forEach(d => d.draw())
		})
		star.forEach((s) => {
			s.forEach(d => d.draw())
		})
		// buildBg.draw()
		playerKite.draw()
		lineKite.draw()
		scoreText.draw()
		timerText.update()
		animId = window.requestAnimationFrame(animateStart)
	}
 
	function animateFall(timestep) {
		if(startJump == undefined) {
			startJump = timestep
		}
		let dur = timestep - startJump 
		let ease = easingDn(dur/duration)

		if (playerKite.y < clienth) {
			c.clearRect(0,0,canvas.width, canvas.height)
			
			cloud.forEach((c) => {
				c.forEach(d => d.draw())
			})
			// buildBg.draw()

			star.forEach((s) => {
				s.forEach(d => d.draw())
			})

			obstacles.forEach(o => {
				if (o.x + o.r > clientw && o.speed > 0) {
					o.speed = -o.speed
				} else if (o.x - o.r < 0 && o.speed < 0) {
					o.speed = -o.speed
				}
				o.side()
				o.draw()

				//collision
				if (o.x <= playerKite.x + playerKite.w && o.x >= playerKite.x && o.y <= playerKite.y + playerKite.h && o.y >= playerKite.y) {
					lose = true
				}
			})
			// debug.forEach((d)=> {
			// 	d.draw()
			// })

			let tail = new Trail(c, playerKite.x, playerKite.y)
			tails.push(tail)

			tails = tails.filter(d => d.opacity > 0)

			tails.forEach((d) => {
				d.fade()
				d.draw()
			})
			playerKite.fall(ease)
			playerKite.draw()
			lineKite.fall(playerKite.x+pw/2, playerKite.y+ph/2)
			lineKite.draw()
			if(popScore) {
				popScore.fade()
				popScore.draw()
			}
			if(hitScore) {
				hitScore.fade()
				hitScore.draw()
			}
			scoreText.draw()
			animId = window.requestAnimationFrame(animateFall)
		} else {
			window.cancelAnimationFrame(animId)
			startFall = undefined
			startJump = undefined
			lose = true
		}
		
	}

	function animateJump(timestep) {
	  	if(startJump == undefined) {
			startJump = timestep
		}
		let dur = timestep - startJump 
		let ease = easingUp(dur/duration)		
		if (dur < duration) {
			c.clearRect(0,0,canvas.width, canvas.height)

			//text
			rText += (distrText/levelDivider) * (speed-(ease*speed))
			gText += (distgText/levelDivider) * (speed-(ease*speed))
			bText += (distbStar/levelDivider) * (speed-(ease*speed))
			
			if (playerKite.y <= clienth/2) {
					heightLevel+=speed-(ease*speed)
					frameCount++
					// console.log(frameCount)
					if (heightLevel >= 2500) {
						//sky
						r += (distr/levelDivider) * (speed-(ease*speed))
						g += (distg/levelDivider) * (speed-(ease*speed))
						b += (distb/levelDivider) * (speed-(ease*speed))
						
						skyContainer.style.backgroundColor = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`

						//building
						rBuilding += (distrBuild/levelDivider) * (speed-(ease*speed))
						gBuilding += (distgBuild/levelDivider) * (speed-(ease*speed))
						bBuilding += (distbBuild/levelDivider) * (speed-(ease*speed))

						//cloud
						rCloud += (distrCloud/levelDivider) * (speed-(ease*speed))
						gCloud += (distgCloud/levelDivider) * (speed-(ease*speed))
						bCloud += (distbCloud/levelDivider) * (speed-(ease*speed))

						//star
						rStar += (distrStar/levelDivider) * (speed-(ease*speed))
						gStar += (distgStar/levelDivider) * (speed-(ease*speed))
						bStar += (distbStar/levelDivider) * (speed-(ease*speed))
					}

					cloud.forEach((c) => {
						c.forEach((d) => {
							d.update(ease, rCloud, gCloud, bCloud)
							d.draw()
						})
					})
					// buildBg.update(rBuilding, gBuilding, bBuilding)
					// buildBg.draw()

					star.forEach((s) => {
						s.forEach((d) => {
							d.update(ease, rStar, gStar, bStar)
							d.draw()
						})
					})

					obstacles.forEach(o => {
						if (o.x + o.r > clientw && o.speed > 0) {
							o.speed = -o.speed
						} else if ( o.x - o.r < 0 && o.speed < 0) {
							o.speed = -o.speed
						}
						o.side()
						o.down(ease, speed)
						o.draw()
						
						//collision
						if (o.x <= playerKite.x + playerKite.w && o.x >= playerKite.x && o.y <= playerKite.y + playerKite.h && o.y >= playerKite.y) {
							lose = true
						}
					})
					if (Math.round(frameCount % 10 == 0)) {
						score++
						popScore = new scorePop(c, playerKite.x, playerKite.y, 1)
						popScore.draw()
					}
					if(popScore) {
						popScore.fade()
						popScore.draw()
					}
					if(hitScore) {
						hitScore.fade()
						hitScore.draw()
					}
			} else {
				
				cloud.forEach((c) => {
					c.forEach((d) => {
						d.draw()
					})
				})
				
				// buildBg.draw()

				obstacles.forEach(o => {
					if (o.x + o.r > clientw && o.speed > 0) {
						o.speed = -o.speed
					} else if (o.x - o.r < 0 && o.speed < 0) {
						o.speed = -o.speed
					}
					o.side()
					o.draw()
				})
			}
			let minStar0 = [...star[0].map(d => {return {y:d.y, i:d.index}})]
			let minStar1 = [...star[1].map(d => {return {y:d.y, i:d.index}})]
			let minY0 = Math.min(...minStar0.map(d => d.y))
			let minY1 = Math.min(...minStar1.map(d => d.y))

			// console.log(minY0, minY1)


			if (minY0 >= clienth) {
				// console.log("change stars 0")
				populateStarsClouds(stars, 0 ,40, 5000, 2)

				stars[0].forEach((d,j) => {
					star[0][j] = new Star(c, scaleX(d.x), d.y, 20, rStar, gStar, bStar, 0)
					star[0][j].draw()
				})
			}
			if (minY1 >= clienth)  {
				// console.log("change stars 1")
				populateStarsClouds(stars, 1 ,40, 5000, 2)

				stars[1].forEach((d,j) => {
					star[1][j] = new Star(c, scaleX(d.x), d.y, 20, rStar, gStar, bStar, 1)
					star[1][j].draw()
				})
			}

			let minC = Math.min(...cloud.map(d => d.y))
			if (minC >= -1 && minC <= 1) {
				clouds.forEach((d,i) => {
					cloud[i] = new Cloud(c,scaleX(d.x),d.y, rCloud, gCloud, bCloud)
					cloud[i].draw() 
				})
			}

			star.forEach((s, i) => {
				s.forEach((d) => {
					if (d.x > playerKite.x
						&& d.x < playerKite.x + pw ) {
						if(d.y > playerKite.y
							&& d.y < playerKite.y + ph) {
							if (!d.hit) {
									score+=10
									hitScore = new scorePop(c, d.x, d.y, 10)
									hitScore.draw()
								}
								d.delete()
							}
					}
					d.draw()
				})
				
			})

			

			// let minD = Math.min(...debug.map(d => d.y))
			// if (minD >= -1 && minC <= 1) {
			// 	debugHeight.forEach((d,i) => {
			// 		debug[i] = new Height(c, d.height, d.height+level*1800, i)
			// 		debug[i].draw() 
			// 	})
			// }
			if (playerKite.y + ph <= 0) {
				lose = true
			}
			// debug.forEach((d)=> {
			// 	if (playerKite.y <= clienth/2) {
			// 		d.update(ease)
			// 		d.draw()
			// 	} else {
			// 		d.draw()
			// 	}
			// })
			let tail = new Trail(c, playerKite.x, playerKite.y)
			tails.push(tail)

			tails = tails.filter(d => d.opacity > 0)

			tails.forEach((d) => {
				d.fade()
				d.draw()
			})
			playerKite.jump(ease)
			playerKite.draw()
			lineKite.jump(playerKite.x+pw/2, playerKite.y+ph/2)
			lineKite.draw()
			if(popScore) {
				popScore.fade()
				popScore.draw()
			}
			if(hitScore) {
				hitScore.fade()
				hitScore.draw()
			}
			scoreText.update(ease, rText, gText, bText)
			scoreText.draw()
			animId = window.requestAnimationFrame(animateJump)
		}
		else {
			window.cancelAnimationFrame(animId)
			up = false
			animId = window.requestAnimationFrame(animateFall)
			startFall = undefined
			startJump = undefined
		}
		
	}
 
	function animateSide() {
		if (playerKite.x + pw < 0 || playerKite.x > clientw) {
			lose = true
		}		
		if (direction == "left") {
			window.cancelAnimationFrame(moveId)
			playerKite.left(offset)
			moveId = window.requestAnimationFrame(animateSide) 
		} else if (direction == "right") {
			window.cancelAnimationFrame(moveId)
			playerKite.right(offset)
			moveId = window.requestAnimationFrame(animateSide)
		}
		
	}

	function scorePop(c, x, y, n) {
		this.x = x
		this.y = y
		this.opacity = 1
		this.score = n

		this.draw = () => {
			c.fillStyle=`rgba(${n == 10 ? rStar : 0},${n == 10 ? gStar: 0},${b == 10 ? rStar: 0},${this.opacity})`
			c.font = "1.5rem monospace";
			c.textAlign = "center"
			c.strokeStyle = `rgba(0,0,0,${this.opacity})`
			c.strokeText(`+${n}`, this.x, this.y)
			c.fillText(`+${n}`, this.x, this.y)
			c.strokeStyle = "none"
		}

		this.fade = () => {
			if (this.opacity > 0) {
				this.opacity-=0.02
			}
		}

	}

	function Obstacle( c, y, speed) {
		this.speed = speed
		this.y = -y
		this.x = Math.random() * 260 + 20
		this.r = 20
		this.opacity=0.5
		
		this.image = new Image()
		this.image.src="/images/obs.png"

		this.draw = () => {
			// console.log(obsAvatar)
			c.drawImage(this.image, this.x-this.r, this.y-this.r, this.r*2, this.r*2)
			// c.fillStyle="black"
			// c.beginPath()
			// c.arc(this.x, this.y ,this.r,0,2*Math.PI)
			// c.fill()
			// c.closePath()
		}
		this.side = () => {
			this.x+=this.speed
		}
		this.down = (ease, speed) => {
			this.y+=(speed-(speed*ease))
		}
	}

	function Building(c, r, g, b) {
		this.r = r
		this.g = g
		this.b = b

		this.draw = () => {
			c.fillStyle=`rgb(${this.r}, ${this.g}, ${this.b})`
			c.beginPath()
			c.moveTo(scaleX(0), clienth-100)
			c.lineTo(scaleX(1), clienth-100)
			c.lineTo(scaleX(1), clienth-120)
			c.lineTo(scaleX(2), clienth-120)
			c.lineTo(scaleX(2), clienth-50)
			c.lineTo(scaleX(3), clienth-50)
			c.lineTo(scaleX(3), clienth-70)
			c.lineTo(scaleX(4), clienth-70)
			c.lineTo(scaleX(4), clienth-150)
			c.lineTo(scaleX(5), clienth-150)
			c.lineTo(scaleX(5), clienth-120)
			c.lineTo(scaleX(6), clienth-120)
			c.lineTo(scaleX(6), clienth-100)
			c.lineTo(scaleX(6), clienth)
			c.lineTo(scaleX(0), clienth)
			c.fill()
			c.closePath
		}

		this.update = (r,g,b) => {
			this.r = r
			this.g = g
			this.b = b
		}
	}

	function Timer(c) {
		this.draw = () => {
			c.fillStyle="black"
			c.font = "3rem monospace";
			c.textAlign = "center"
			c.fillText(startTimer, clientw/2, 200)
		}
		this.update = () => {
			c.fillStyle="black"
			c.font = "3rem monospace";
			c.fillText(startTimer, clientw/2, 200)
		}
	}

	function Height(c, y, s, i) {
		this.i = i
		this.s = s
		this.y = -y
		this.draw = () => {
			c.fillStyle="black"
			c.font = "0.7rem monospace";
			c.textAlign = "left"
			c.fillText(this.s, 20, this.y)

			c.fillStyle="black"
			c.font = "0.7rem monospace";
			c.textAlign = "left"
			c.fillText(30-this.i, 60, this.y)

			c.strokeStyle="black"
			c.beginPath()
			c.moveTo(80,this.y)
			c.lineTo(clientw-20,this.y)
			c.stroke()
			c.closePath()
		}
		this.update = (ease) => {
			this.y+=(speed-(speed*ease))
		}
	}

	function Score(c, r, g, b) {
		this.r = r
		this.g = g
		this.b = b

		this.draw = () => {
			c.fillStyle=`rgb(${this.r}, ${this.g}, ${this.b})`
			c.font = "3rem monospace";
			c.textAlign = "center"
			c.fillText(score, clientw/2, 80)

			// c.fillStyle="black"
			// c.font = "1.8rem monospace";
			// c.textAlign = "center"
			// c.fillText(Math.round(heightLevel), clientw/2, 120)
		}
		this.update = (r,g,b) => {
			this.r = r
			this.g = g
			this.b = b
		}
	}

	function Trail(c,x,y) {
		this.x=x
		this.y=y
		this.opacity=0.5
		this.radius=15
		
		this.draw = () => {
			c.fillStyle = `rgba(255,255,255,${this.opacity})`
			c.beginPath()
			c.arc(this.x+(pw/2),this.y+(ph/2),this.radius,0,Math.PI*2)
			c.fill()
			c.closePath()
		}
		this.fade = () => {
			if (this.opacity > 0) {
				this.opacity-=0.005	
			}
			if (this.radius > 0) {
				this.radius-=0.5
			}
		}
	}

	function Tali(c,x1,y1, x2, y2) {
		this.x1=x1
		this.y1=y1
		this.x2=x2
		this.y2=y2
		this.cx1=x1
		this.cy1=y1+100
		this.cx2=x2
		this.cy2=y2+clienth/3
		this.draw = () => {
			c.strokeStyle=`rgb(${rText},${gText},${bText})`
			c.beginPath()
			c.moveTo(this.x1, this.y1+300)
			c.bezierCurveTo(this.cx1, this.cy1, this.cx2, this.cy2, this.x2, this.y2);
			c.stroke();
			c.closePath()

			// c.fillStyle="green"
			// c.beginPath()
			// c.arc(this.cx1, this.cy1, 10, 0, 2*Math.PI)
			// c.fill()
			// c.closePath

			// c.fillStyle="yellow"
			// c.beginPath()
			// c.arc(this.cx2, this.cy2, 10, 0, 2*Math.PI)
			// c.fill()
			// c.closePath()
		}
		this.jump = (x,y) => {
			this.x2=x
			this.y2=y
			this.cx2=x
			this.cy2=y2+clienth/3
		}

		this.fall = (x,y) => {
			this.x2=x
			this.y2=y
			this.cx2=x
			this.cy2=y2+clienth/3
		}
	}

	function Player(c, x, y, pw, ph) {
		this.x = x
		this.y = y
		this.w = pw
		this.h = ph

		this.draw = () => {
			//shadow
			c.filter = `drop-shadow(0px 0px 5px rgb(${rBuilding},${gBuilding},${bBuilding}))`
			c.drawImage(kiteAvatar, this.x, this.y, this.w, this.h)
			c.filter = "none"
		}

		this.jump = (ease) => {
			up = true
			// height=(((0.75*clienth)-newHeight)*ease)+newHeight
			this.y-=(speed-(speed*ease))
		}	
		
		this.fall = (ease) => {
			let e = Math.min(ease,1.5)
			up = false
			this.y+=speed*e
		}

		this.ground = () => {
			this.y = clienth
		}

		this.left = (d) => {
			this.x-=(d/50)
		}

		this.right = (d) => {
			this.x+=(d/50)
		}
	
	}

	function Star(c,x,y,s, r, g, b, i) {
		this.x = x
		this.y = -y
		this.s = s
		this.opacity = 1
		this.hit = false
		this.index = i

		this.colorR = r
		this.colorG = g
		this.colorB = b

		this.textY = y

		// if (level == 1) {
		// 	this.colorR = "255"
		// 	this.colorG = "234"
		// 	this.colorB = "33"
		// } else if (level == 2) {
		// 	this.colorR = "255"
		// 	this.colorG = "130"
		// 	this.colorB = "0"
		// } else if (level == 3) {
		// 	this.colorR = "185"
		// 	this.colorG = "0"
		// 	this.colorB = "210"
		// }
		
		
		this.draw = () => {
			c.fillStyle = `rgba(${this.colorR}, ${this.colorG}, ${this.colorB}, ${this.opacity})`
			c.beginPath()
			c.moveTo(this.x-(this.s/12*5),this.y-(this.s/12))
			//1
			c.bezierCurveTo(this.x-(this.s/4), this.y-(this.s/12), this.x-(this.s/12), this.y-(this.s/4), this.x-(this.s/12), this.y-(this.s/12*5))
			//2
			c.bezierCurveTo(this.x-(this.s/12), this.y-(this.s/2), this.x+(this.s/12), this.y-(this.s/2), this.x+(this.s/12), this.y-(this.s/12*5))
			//3
			c.bezierCurveTo(this.x+(this.s/12),this.y-(this.s/4),this.x+(this.s/4),this.y-(this.s/12),this.x+(this.s/12*5),this.y-(this.s/12))
			//4
			c.bezierCurveTo(this.x+(this.s/2), this.y-(this.s/12), this.x+(this.s/2), this.y+(this.s/12), this.x+(this.s/12*5), this.y+(this.s/12))
			//5
			c.bezierCurveTo(this.x+(this.s/4), this.y+(this.s/12), this.x+(this.s/12), this.y+(this.s/4), this.x+(this.s/12), this.y+(this.s/12*5))
			//6
			c.bezierCurveTo(this.x+(this.s/12), this.y+(this.s/2), this.x-(this.s/12), this.y+(this.s/2), this.x-(this.s/12), this.y+(this.s/12*5))
			//7
			c.bezierCurveTo(this.x-(this.s/12), this.y+(this.s/4), this.x-(this.s/4), this.y+(this.s/12), this.x-(this.s/12*5), this.y+(this.s/12))
			//8
			c.bezierCurveTo(this.x-(this.s/2), this.y+(this.s/12), this.x-(this.s/2), this.y-(this.s/12), this.x-(this.s/12*5), this.y-(this.s/12))
			c.fill()
			c.closePath()
			
			// c.strokeStyle = `rgba(0, 0, 0, ${this.opacity})`
			// c.beginPath()
			// c.moveTo(this.x-(this.s/2),this.y)
			// c.bezierCurveTo(this.x-(this.s/4), this.y, this.x, this.y-(this.s/4), this.x, this.y-(this.s/2))
			// c.bezierCurveTo(this.x,this.y-(this.s/4),this.x+(this.s/4),this.y,this.x+(this.s/2),this.y)
			// c.bezierCurveTo(this.x+(this.s/4),this.y,this.x,this.y+(this.s/4),this.x,this.y+(this.s/2))
			// c.bezierCurveTo(this.x,this.y+(this.s/4),this.x-(this.s/4),this.y,this.x-(this.s/2),this.y)
			// c.stroke()
			// c.closePath()

			// c.fillStyle="black"
			// c.font = "1rem monospace";
			// c.textAlign = "center"
			// c.fillText(this.textY, this.x, this.y-10)
		}

		this.update = (ease, r, g, b) => {
			this.colorR = r
			this.colorG = g
			this.colorB = b
			this.y+=(speed-(speed*ease))
		}

		this.delete = () => {
			this.hit = true
			this.opacity = 0
		}
	}

	function Cloud(c, x , y, r, g, b) {
		this.x = x
		this.y = -y

		this.r = r
		this.g = g
		this.b = b

		this.draw = () => {
			c.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
			c.beginPath()
			c.arc(this.x,this.y+25,25,0,Math.PI*2)
			c.fill()
			c.closePath()
			
			c.beginPath()
			c.arc(this.x+80,this.y+15,20,0,Math.PI*2)
			c.fill()
			c.closePath()

			c.beginPath()
			c.arc(this.x+105,this.y+35,15,0,Math.PI*2)
			c.fill()
			c.closePath()

			c.beginPath()
			c.arc(this.x+35,this.y,40,0,Math.PI*2)
			c.fill()
			c.closePath()
 
			c.fillRect(this.x-5,this.y+20,110,30)
		}

		this.update = (ease, r, g, b) => {
			this.r = r
			this.g = g
			this.b = b
			let cloudspeed = speed/8
			this.y+=(cloudspeed-(cloudspeed*ease))
		}
	}

	function tapHandler(e) {
		if (start) {
			if(e.detail.x > clientw/2) {
				offset = e.detail.x-(clientw/2)
				// tap on right, move left
				direction = "left"
				animateSide()
			} else if (e.detail.x < clientw/2) {
				offset = (clientw/2)-e.detail.x
				// tap on left, move right
				direction="right"
				animateSide()

			}
			if (start) {
				startJump = undefined
				newHeight = height
				if (!up) {
					window.cancelAnimationFrame(animId)
					animId = window.requestAnimationFrame(animateJump)
				}
			}
		}
	}
 
	function scrollPan(register) {
		const pressFns = register(press, {
		triggerBeforeFinished: true,
		spread: 10,
		timeframe: 100,
		});
		const scrollFns = register(scroll, { delay: 0 });
		const panFns = register(pan, { delay: 0 });

		return (activeEvents, event) => {
		pressFns.onMove(activeEvents, event) || event.pointerType !== 'touch'
			? panFns.onMove(activeEvents, event)
			: scrollFns.onMove(activeEvents, event);
		};
	};

	function keydown(e) {
		console.log(e)
		if(e.keyCode == 123) {
			e.stopPropagation()
			e.preventDefault()
		return false;
		}
		if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
			e.stopPropagation()
			e.preventDefault()
		return false;
		}
		if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
			e.stopPropagation()
			e.preventDefault()
			return false;
		}
		if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
			e.stopPropagation()
			e.preventDefault()
		return false;
		}
	}

	$: if(heightLevel) {
		if (skyContainer) {
			let rgbSkyContainer = skyContainer.style.backgroundColor.replace("rgb(", "").replace(")","").split(", ")
			cR = rgbSkyContainer[0]
			cG = rgbSkyContainer[1]
			cB = rgbSkyContainer[2]

			if(cR == skyColor[level][0] && cG == skyColor[level][1] && cB == skyColor[level][2]) {
				if (level < 10) {
					// console.log("under 10")
					// console.log(level, "before")
					level++
					obsSpeed += 0.25
					// console.log(level, "after")
				} else {
					// console.log("reset level")
					// console.log(level, "before")
					obstacleCoordinate.forEach((d, i) => {
						obstacles[i] = new Obstacle(c,d.y, obsSpeed)
						obstacles[i].draw()
					})
					level = 1
					// console.log(level, "after")
				}
				

				// sky color
				r = skyColor[level-1][0]
				g = skyColor[level-1][1]
				b = skyColor[level-1][2]

				distr = skyColor[level][0]-r
				distg = skyColor[level][1]-g
				distb = skyColor[level][2]-b	

				// build color
				rBuilding = buildColor[level-1][0]
				gBuilding = buildColor[level-1][1]
				bBuilding = buildColor[level-1][2]

				distrBuild = buildColor[level][0]-rBuilding
				distgBuild = buildColor[level][1]-gBuilding
				distbBuild = buildColor[level][2]-bBuilding

				// star color
				rStar = starColor[level-1][0]
				gStar = starColor[level-1][1]
				bStar = starColor[level-1][2]

				distrStar = starColor[level][0]-rStar
				distgStar = starColor[level][1]-gStar
				distbStar = starColor[level][2]-bStar

				// text color
				rText = textColor[level-1][0]
				gText = textColor[level-1][1]
				bText = textColor[level-1][2]

				distrText = textColor[level][0]-rText
				distgText = textColor[level][1]-gText
				distbText = textColor[level][2]-bText

				// cloud color
				rCloud = cloudColor[level-1][0]
				gCloud = cloudColor[level-1][1]
				bCloud = cloudColor[level-1][2]

				distrCloud = cloudColor[level][0]-rCloud
				distgCloud = cloudColor[level][1]-gCloud
				distbCloud = cloudColor[level][2]-bCloud

				// sun color
				rSun = sunColor[level-1][0]
				gSun = sunColor[level-1][1]
				bSun = sunColor[level-1][2]

				distrSun = sunColor[level][0]-rSun
				distgSun = sunColor[level][1]-gSun
				distbSun = sunColor[level][2]-bSun
			}
			
		}
	}

	$: if (lose) {
		// console.log("lose")
		window.cancelAnimationFrame(animId)
		window.cancelAnimationFrame(moveId)
		start = false
		dialog3.style.display="flex"
		dialog3.showModal()
	}

	$: if (leaderBoard) {
		leaderBoard = leaderBoard
	}
	
</script>

<!-- <svelte:window on:keydown={keydown}></svelte:window> -->

<svelte:head>
	<meta
		name='viewport' 
		content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
	/>

	{#each kiteData as k}
		<link rel="preload" as="image" href={k.img} crossorigin>
	{/each}
	<link rel="preload" as="image" href="/images/yanglayang_bg.png" crossorigin>
	
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">
	<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
</svelte:head>

<!-- <svelte:window on:keydown={keydown}></svelte:window> -->
<svelte:body on:contextmenu={(e) => {
			e.stopPropagation();
			e.preventDefault();
		return false
}} />

<section bind:this={bodySection} style:opacity={show ? 1 : 0}>
	<div 
		bind:this={skyContainer} 
		class="container" 
		bind:clientHeight = {clienth} 
		bind:clientWidth={clientw}>
		<canvas 
			bind:this={canvas} 
			width={w} 
			height={h}
			
			use:tap={{touchAction:"none"}} 
			on:tap={tapHandler}
			use:composedGesture={scrollPan}
			></canvas>
	</div>
	
</section>

<!-- front -->
<dialog bind:this={dialog1} class="dialog1">
	<img 
		style:width="88%"
		style:max-width="400px"
		src="/images/yanglayang_logo.png" 
		alt="logo yanglayang" 
		style:margin-bottom="2rem"
	/>
	<DeviceDetector showInDevice="desktop">
		<p style:font-family="Montserrat">
			Klik untuk melayang dan menjaga tempo<br>
			Posisi klik menentukan arah gerak layang-layang
		</p>
	</DeviceDetector>

	<DeviceDetector showInDevice="mobile">
		<p style:font-family="Montserrat">
			Tap untuk melayang dan menjaga tempo<br>
			Posisi tap menentukan arah gerak layang-layang
		</p>
	</DeviceDetector>
	
	<p style:font-family="monospace" style:font-size="1.2rem">
		<strong>Pro-tip: SABAR</strong>
	</p>
		
	<div style:display="flex" style:gap="0.5rem">
		<button class="startButton" on:click={nextIntro}>PILIH LAYANGAN</button>
		<button class="startButton" on:click={toggleSound}>
			<Fa icon={audioPlay ? faVolumeUp : faVolumeMute} />
		</button>
	</div>
	
</dialog>

<!-- select kite -->
<dialog bind:this={dialog2} style:display="none" class="dialog2">
	<div class="kiteProfile">
		<div class="kiteImage">
			<!-- <p style:font-size="0.8rem"
				style:wrap="wrap"
			>ilustrasi layangan</p> -->
			<img src={kiteData[kiteSelect ?? 0].img} alt={kiteData[kiteSelect ?? 0].name} loading="lazy"/>
		</div>
		<div class="kiteData">
			<h1>{kiteData[kiteSelect ?? 0].name}</h1>
			<h3>{kiteData[kiteSelect ?? 0].region}</h3>
			<p  style:color="#1C0A3E" style:width="88%" style:max-width="350px">{@html kiteData[kiteSelect ?? 0].desc}</p>
		</div>
	</div>
	<h3
		style:font-family="Montserrat"
		style:font-size="0.9rem"
		style:margin-bottom="0.5rem"
		style:font-weight="400"

	>Pilih Layangan</h3>
	<div class="kiteChoice noSelect">
		
		{#each kiteData as k,i}
			<div 
			class="kC noSelect" data-index={i}
			class:selected={kiteSelect == i} 
			on:click={chooseKite}>
			<img 
			style:opacity={kiteSelect == i ? 1 : 0.5}
			src={k.img} alt={k.name} loading="lazy"/>
			
		</div>
		{/each}
	</div>
	<button class="startButton" on:click={startGame}>MULAI MAIN LAYANGAN</button>
</dialog>


<!-- leaderboard -->
<dialog bind:this={dialog3} style:display="none" class="dialog3">
	<div 
		class="submitToast"
		bind:this={submitToast}
		>Skormu tersubmit</div>
	<h1 style:margin-top="0"
		style:margin-bottom="0.5rem"
	>Layanganmu Telap</h1>
	<h2 
		style:font-family="Montserrat"
		style:margin="0"	
		style:font-size="1.2rem"
	>Skormu</h2>
	<h1 
		style:margin="0" 
		style:color="#e25010">{score}</h1>
	<form 
		style:margin-bottom="1rem"
		style:margin-top="1rem"
		style:display="flex"
		style:justify-content="center"
	>
		<input 
			style:font-size="1.2rem"
			style:font-family="Montserrat"
			style:padding="0.5rem"
			style:border-radius="0.5rem"
			style:margin-right="0.5rem"
			style:width="60%"
			bind:this={inputtext} 
			id="name" 
			bind:value={inputName} placeholder="tulis @handleTwitter-mu" type="text" />
		<input class="startButton" bind:this={inputbutton} type="submit" on:click={insertData} value="SUBMIT"/>
	</form>
	{#if leaderBoard}
	{#each leaderBoard.sort((a,b) => b.score-a.score).splice(0,10) as d, i}
	<div class="leaderboard">
		<div 
			style:width="1.5rem" 
			style:background-color={i+1 == 1 ? "#e25010" : i+1 == 2 ? "#e89b34" : i+1 == 3 ? "#edcf54" : i+1 == 4 ? "#eddb85" : "transparent"}
			style:color={i+1 <= 4 ? "#1a0b3d" : "#1C0A3E"}
			style:border-radius = "50%"
			style:aspect-ratio="1"
			style:display="flex"
			style:justify-content="center"
			style:align-items="center"
			style:font-weight={i+1 == 1 ? 800 : i+1 == 2 ? 700 : i+1 == 3 ? 600 : 400}>
		{i+1}</div>
			<div 
			style:display="flex" 
			style:justify-content="flex-start"
			style:align-items="center"
			style:flex-grow="2"
			style:font-weight={i+1 == 1 ? 800 : i+1 == 2 ? 700 : i+1 == 3 ? 600 : 400}>
		{d.name}</div>
		<div 
			style:display="flex" 
			style:justify-content="flex-end"
			style:flex-grow="1" 
			style:font-weight={i+1 == 1 ? 800 : i+1 == 2 ? 700 : i+1 == 3 ? 600 : 400}>
		{d.score}</div>
	</div>
	{/each}
	{/if}
	<div style:display="flex" style:gap="0.5rem">
		<button class="startButton" on:click={restartGame}>MAIN LAGI</button>
		<button class="startButton" on:click={toggleSound}>
			<Fa icon={audioPlay ? faVolumeUp : faVolumeMute} />
		</button>
	</div>
	
</dialog>


<style>
	:global(body, html) {
		margin:0;
		padding:0;
		background-color: #B6D4EF;
		overflow:hidden;
	}
	.submitToast {
		position:absolute;
		background-color: #e3f2ff;
		box-shadow: 0 0 5px 2px rgb(28, 10, 62, 0.1);
		color:#1C0A3E;
		border-radius: 0.5rem;
		opacity: 0;
		padding:1rem;
		font-size:1.5rem;
		font-family: "Montserrat", sans-serif;
		font-weight: 600;
		transition: opacity 500ms ease-in-out;
	}
	.dialog1 {
		display:flex;
	}
	.dialog2 {
		display:none;
	}
	.dialog3 {
		display:none;
	}
	section {
		width:100%;
		display: flex;
		opacity:0;
		justify-content:center;
		align-items: center;
		height:100vh;
		background-color:#d4ffff;
		background-image:url('/images/yanglayang_bg.png');
		background-size:cover;
		pointer-events: none;
	}
	.kiteProfile {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.kiteImage {
		width:150px;
		height:150px;
		/* background-color: coral; */
	}
	.kiteImage>img {
		width:100%;
		height:100%;
	}
	.kiteData {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom:1rem;
	}
	.kiteData > h1 {
		margin:0;
		margin-top:0.5rem;
		font-family: "Alfa Slab One", cursive;
		font-weight:400;
		color:#046261;
	}
	.kiteData > h3 {
		margin:0;
		font-family: "Montserrat", sans-serif;
		font-weight:600;
		font-size:1.2rem;
		color:#1C0A3E;
	}
	.kiteData > p {
		margin-top:0.5rem;
		font-family: "Montserrat", sans-serif;
		font-size:0.8rem;
		line-height: 1.2rem;
		text-align: left;

	}
	
	.kiteChoice {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap:0.5rem;
		margin-bottom:2rem;
		cursor:pointer;
	}
	.kC {
		width:50px;
		height:50px;
		background-color: transparent;
		border-radius: 0.5rem;
		display:flex;
		justify-content: center;
		align-items: center;
	}
	.kC>img {
		height:90%;
		width:90%;
		pointer-events: none;
	}
	.selected {
		border:solid 3px #eeb482;
	}
	.container {
		height: 100%;
		width: 100%;
		max-width: 640px;
		display:flex;
		align-items: center;
		justify-content: center;
	}
	.leaderboard {
		background-color: transparent;
		margin:0;
		margin-bottom:0.5rem;
		display: flex;
		font-family: sans-serif;
		width:88%;
		max-width:350px;
		align-items: space-between;
		gap:0.25rem;
	}
	.leaderboard > div {
		margin:0;
		background-color: transparent;
	}
	.noSelect {
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.startButton {
		background-color:#e3f2ff;
		color: #046362;
		font-family: "Montserrat", sans-serif;
		font-weight:600;
		font-size:1.2rem;
		padding:0.5rem;
		cursor:pointer;
		transition:all 200ms ease-in-out;
		border-radius:0.5rem;
	}
	.startButton:hover {
		background-color:#046362;
		color: #e3f2ff;
	}
	.startButton:disabled, .startButton[disabled] {
		background-color:#9fbcd6;
		color: #8aa6bf;
		cursor:not-allowed;
		pointer-events: none;
	}
	dialog {
		width:100%;
		height:100%;
		display:flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		background-color:#B6D4EF;
		color:#1a0b3d;
		border: none;
		max-width:100%;
		max-height:100%;
		margin:0;
		padding:0;
	}
	h1, h2 {
		font-family: 'Alfa Slab One', cursive;
		font-weight: 400;
	}
	h3 {
		font-family:sans-serif;
		font-weight:100;
		margin:0;
	}
	p {
		text-align: center;
		font-family: sans-serif;
	}
	canvas {
		pointer-events:all;
	}
	@media (hover: none) {
		.startButton:hover { 
			background-color:#e3f2ff;
			color: #046362;
		}
	}
</style>
