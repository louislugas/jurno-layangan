<script>
	import BezierEasing from 'bezier-easing'
	import {onMount} from 'svelte'
	import { swipe, tap, composedGesture, press, scroll, pan } from 'svelte-gestures';
	import {axisLeft, scaleLinear} from 'd3'
	import supabase from '$lib/db'

	let inputName, inputForm, leaderBoard, inputtext, inputbutton

	async function getData() {
		let { data } = await supabase
			.from('kitescore')
			.select('name, score')
		leaderBoard = data
    }

	async function insertData() {
		inputtext.disabled = true
		inputbutton.disabled = true
		await supabase
			.from("kitescore")
			.insert({name: inputName, score: score})
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
                await getData()
            }
        ).subscribe()

	// const easingUp = BezierEasing(0.61, 1, 0.88, 1) //easeOutSine
	// const easingDn = BezierEasing(0.12, 0, 0.39, 0) //easeInSine 

	const easingUp = BezierEasing(0.22, 1, 0.36, 1) //easeOutQuint
	const easingDn = BezierEasing(0.64, 0, 0.78, 0) //easeInQuint

	let clientw, clienth
	let w = 300, h = 400
	let pw = 40, ph = 40
	let animId, moveId
	let canvas, playerKite, cloud = [], star = [], c
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

	let stars= []
	let clouds = []

	let dialog1, dialog2, dialog3
	let skyContainer
	let startTimer = 3
	let debugHeight = [], debug = []
	let level = 1
	let levelArray= [5, 2, 1]
	let tails = []
	let offset = 0
	let timerInterval

	onMount(async() => {
		await getData()

		dialog1.showModal()
		dialog2.style.display="none"
		dialog3.style.display="none"
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

		for(let i=0;i<30;i++) {
			let r = Math.round(Math.random()*levelArray[level-1])
			if (r != 0) {
				stars[i] = {
					x:Math.round(Math.random() * 4 + 1),
					y:i*60
				}
			} else {
				stars[i] = {
					x:10,
					y:i*60
				}
			}
		}

		for(let i=0;i<25;i++) {
			clouds[i] ={
				x:Math.round(Math.random() * (clientw + 100) - 100),
				y:(Math.round(Math.random() * 25)*400) - 2500
			}
		}

		for(let i=0;i<30;i++) {
			debugHeight[i] = {
				height:i*60-30,
			}
		}

		c = canvas.getContext("2d")
		
		playerKite = new Player(c, scaleX(kitePosX)-(pw/2),kitePosY, pw, ph)
		playerKite.draw()

		scoreText = new Score(c)
		scoreText.draw()

		timerText = new Timer(c)
		timerText.draw()

		clouds.forEach((d,i) => {
			cloud[i] = new Cloud(c,d.x,d.y)
			cloud[i].draw() 
		})

		stars.forEach((d,i) => {
			star[i] = new Star(c, scaleX(d.x), d.y, 20, level)
			star[i].draw() 
		})

		debugHeight.forEach((d,i) => {
			debug[i] = new Height(c, d.height, d.height*level, i)
			debug[i].draw()
		})
	
		//animId = window.requestAnimationFrame(animateFall)
	})

	function chooseKite() {
		dialog1.close()
		dialog1.style.display="none"
		dialog2.style.display="flex"
		dialog2.showModal()
	}

	function startGame() {
		dialog2.close()
		dialog2.style.display="none"
		
		tails = []

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
		console.log("restart")
		lose = false

		dialog3.close()
		dialog3.style.display="none"

		tails = []

		// reset all stats
		score = 0
		startTimer = 3
		height = clienth/2 - ph
		kitePosY = (clienth-ph)-height

		playerKite = new Player(c, scaleX(kitePosX)-(pw/2),kitePosY, pw, ph)
		playerKite.draw()

		scoreText = new Score(c)
		scoreText.draw()

		timerText = new Timer(c)
		timerText.draw()

		clouds.forEach((d,i) => {
			cloud[i] = new Cloud(c,d.x,d.y)
			cloud[i].draw() 
		})

		stars.forEach((d,i) => {
			star[i] = new Star(c, scaleX(d.x), d.y, 20, level)
			star[i].draw() 
		})

		debugHeight.forEach((d,i) => {
			debug[i] = new Height(c, d.height, d.height*level, i)
			debug[i].draw()
		})

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
		cloud.forEach((d) => {
			d.draw()
		})
		star.forEach((d) => {
			d.draw()
		})
		playerKite.draw()
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
			cloud.forEach((d) => {
				d.draw()
			})
			star.forEach((d) => {
				d.draw()
			})
			debug.forEach((d)=> {
				d.draw()
			})

			let tail = new Trail(c, playerKite.x, playerKite.y)
			tails.push(tail)

			tails = tails.filter(d => d.opacity > 0)

			tails.forEach((d) => {
				d.fade()
				d.draw()
			})
			playerKite.fall(ease)
			playerKite.draw()
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
			cloud.forEach((d) => {
				if (playerKite.y <= clienth/5*2) {
					score++
					d.update(ease)
					d.draw()
				} else {
					d.draw()
				}
			})
			let minY = Math.min(...star.map(d => d.y))

			if (minY >= clienth-1 && minY <= clienth+1) {
				if(level < 3) {
					level++
				} else {
					level = 1
				}

				stars = []
				
				for(let i=0;i<30;i++) {
					let r = Math.round(Math.random()*levelArray[level-1])
					if (r != 0) {
						stars[i] = {
							x:Math.round(Math.random() * 4 + 1),
							y:i*60
						}
					} else {
						stars[i] = {
							x:10,
							y:i*60
						}
					}
				}

				stars.forEach((d,i) => {
					star[i] = new Star(c, scaleX(d.x), d.y, 20, level)
					star[i].draw() 
				})
			}

			let minC = Math.min(...cloud.map(d => d.y))
			if (minC >= -1 && minC <= 1) {
				clouds.forEach((d,i) => {
					cloud[i] = new Cloud(c,d.x,d.y)
					cloud[i].draw() 
				})
			}

			star.forEach((d, i) => {

			if (playerKite.y <= clienth/5*2) {
				d.update(ease)
				d.draw()
				if (d.x > scaleX(playerKite.x)-(pw/4) 
					&& d.x < scaleX(playerKite.x)+(pw/4) ) {
					if(d.y > playerKite.y +(ph/4)
						&& d.y < playerKite.y + (ph*3/4)) {
						if (!d.hit) {
								if (lifewidth < clientw) {
									lifewidth +=10*lifeMultiplier
								} else if (lifewidth >= clientw - 10 && lifewidth < clientw) {
									lifewidth = clientw
								}
							}
							d.delete()
						}
				}
			} else {
				d.draw()
			}
				
			})

			let minD = Math.min(...debug.map(d => d.y))
			if (minD >= -1 && minC <= 1) {
				debugHeight.forEach((d,i) => {
					debug[i] = new Height(c, d.height, d.height+level*1800, i)
					debug[i].draw() 
				})
				level++
			}
			debug.forEach((d)=> {
				if (playerKite.y <= clienth/5*2) {
					d.update(ease)
					d.draw()
				} else {
					d.draw()
				}
			})
			let tail = new Trail(c, playerKite.x, playerKite.y)
			tails.push(tail)

			tails = tails.filter(d => d.opacity > 0)

			tails.forEach((d) => {
				d.fade()
				d.draw()
			})
			playerKite.jump(ease)
			playerKite.draw()
			scoreText.update()
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
		
		if (direction == "left") {
			window.cancelAnimationFrame(moveId)
			playerKite.left(offset)
			moveId = window.requestAnimationFrame(animateSide) 
		} else if (direction == "right") {
			window.cancelAnimationFrame(moveId)
			playerKite.right(offset)
			moveId = window.requestAnimationFrame(animateSide)
		}
		if (playerKite.x+pw < 0 || playerKite.x > clientw) {
			lose = true
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

	function Score(c) {
		this.draw = () => {
			c.fillStyle="black"
			c.font = "3rem monospace";
			c.textAlign = "center"
			c.fillText(score, clientw/2, 80)

			c.fillStyle="black"
			c.font = "1.8rem monospace";
			c.textAlign = "center"
			c.fillText(score*2-30, clientw/2, 120)
		}
		this.update = () => {
			c.fillStyle="black"
			c.font = "3rem monospace";
			c.textAlign = "center"
			c.fillText(score, clientw/2, 80)

			c.fillStyle="black"
			c.font = "1.8rem monospace";
			c.textAlign = "center"
			c.fillText(score*2-30, clientw/2, 120)
		}
	}

	function Trail(c,x,y) {
		this.x=x
		this.y=y
		this.opacity=0.5
		this.radius=25
		
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

	function Player(c, x, y, pw, ph) {
		this.x = x
		this.y = y
		this.w = pw
		this.h = ph

		this.draw = () => {
			c.fillStyle="red"
			c.fillRect(this.x,this.y,this.w,this.h)
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

	function Star(c,x,y,s, level) {
		this.x = x
		this.y = -y
		this.s = s
		this.opacity = 1
		this.hit = false
		if (level == 1) {
			this.colorR = "255"
			this.colorG = "234"
			this.colorB = "33"
		} else if (level == 2) {
			this.colorR = "255"
			this.colorG = "130"
			this.colorB = "0"
		} else if (level == 3) {
			this.colorR = "185"
			this.colorG = "0"
			this.colorB = "210"
		}
		
		
		this.draw = () => {
			c.fillStyle = `rgba(${this.colorR}, ${this.colorG}, ${this.colorB}, ${this.opacity})`
			c.beginPath()
			c.moveTo(this.x-(this.s/2),this.y)
			c.bezierCurveTo(this.x-(this.s/4), this.y, this.x, this.y-(this.s/4), this.x, this.y-(this.s/2))
			c.bezierCurveTo(this.x,this.y-(this.s/4),this.x+(this.s/4),this.y,this.x+(this.s/2),this.y)
			c.bezierCurveTo(this.x+(this.s/4),this.y,this.x,this.y+(this.s/4),this.x,this.y+(this.s/2))
			c.bezierCurveTo(this.x,this.y+(this.s/4),this.x-(this.s/4),this.y,this.x-(this.s/2),this.y)
			c.fill()
			c.closePath()
			
			c.strokeStyle = `rgba(0, 0, 0, ${this.opacity})`
			c.beginPath()
			c.moveTo(this.x-(this.s/2),this.y)
			c.bezierCurveTo(this.x-(this.s/4), this.y, this.x, this.y-(this.s/4), this.x, this.y-(this.s/2))
			c.bezierCurveTo(this.x,this.y-(this.s/4),this.x+(this.s/4),this.y,this.x+(this.s/2),this.y)
			c.bezierCurveTo(this.x+(this.s/4),this.y,this.x,this.y+(this.s/4),this.x,this.y+(this.s/2))
			c.bezierCurveTo(this.x,this.y+(this.s/4),this.x-(this.s/4),this.y,this.x-(this.s/2),this.y)
			c.stroke()
			c.closePath()
		}

		this.update = (ease) => {
			this.y+=(speed-(speed*ease))
		}

		this.delete = () => {
			this.hit = true
			this.opacity = 0
		}
	}

	function Cloud(c,x,y) {
		this.x = x
		this.y = y

		this.draw = () => {
			c.fillStyle = "white"
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

		this.update = (ease) => {
			this.y+=(speed-(speed*ease))
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

	$: if (lose) {
		console.log("lose")
		window.cancelAnimationFrame(animId)
		window.cancelAnimationFrame(moveId)
		start = false
		dialog3.style.display="flex"
		dialog3.showModal()
	}

	$: if((score/100) % 10 == 0 &&  score != 0) {
		// console.log("change")
	}

	$: if (leaderBoard) {
		leaderBoard = leaderBoard
	}
	
</script>

<!-- <svelte:window on:keydown={keydown}></svelte:window> -->

<section>
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

<dialog bind:this={dialog1}>
	<h1>YANGLAYANG</h1>
	<pre>(ada ilustrasi/logo game)</pre>
	<p>Panduan:<br>
	Mobile: tap untuk naik, swipe untuk geser<br>
	Desktop: klik/spasi untuk naik, panah kiri/kanan utnuk geser</p>
		
		
	<button on:click={chooseKite}>PILIH LAYANGAN</button>
</dialog>

<dialog bind:this={dialog2}>
	<div class="kiteProfile">
		<div class="kiteImage">
			<p style:font-size="0.8rem"
				style:wrap="wrap"
			>ilustrasi layangan</p>
		</div>
		<div class="kiteData">
			<h1>Nama Layangan</h1>
			<p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam voluptates omnis odit exercitationem adipisci assumenda? Repellendus officia dignissimos dolores quidem in doloribus, ipsa enim eum iusto ex aliquam maxime nihil?</p>
		</div>
	</div>
	<div class="kiteChoice noSelect">
		{#each Array(5) as _,i}
			<div 
			class="kC noSelect" data-index={i}
			class:selected={kiteSelect == i} 
			on:click={(e) => {kiteSelect = e.target.dataset.index}}>
			<p style:font-size="0.45rem"
				style:wrap="wrap"
			>thumbnail akan sama dengan gambar di game</p>
		</div>
		{/each}
	</div>
	<button on:click={startGame}>MULAI MAIN LAYANGAN</button>
</dialog>

<dialog bind:this={dialog3}>
	<h1>Layanganmu Telap</h1>
	<h2>Skormu {score}</h2>
	<form style:margin-bottom="2rem">
		<input bind:this={inputtext} id="name" bind:value={inputName} placeholder="tulis namamu" type="text" />
		<input bind:this={inputbutton} type="submit" on:click={insertData} />
	</form>
	{#if leaderBoard}
	{#each leaderBoard.sort((a,b) => b.score-a.score).splice(0,10) as d, i}
	<div class="leaderboard">
		<div 
			style:width="5rem" 
			style:font-weight={i+1 == 1 ? 800 : i+1 == 2 ? 700 : i+1 == 3 ? 600 : 400}>
		{i+1}</div>
			<div 
			style:display="flex" 
			style:justify-content="flex-start"
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
	<button on:click={restartGame}>MAIN LAGI</button>
</dialog>


<style>
	:global(body, html) {
		margin:0;
		padding:0;
	}
	section {
		width:100%;
		display: flex;
		justify-content:center;
		align-items: center;
		height:100vh;
		background-color: rgb(240,240,240);
		pointer-events: none;
	}
	.kiteProfile {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.kiteImage {
		width:200px;
		height:200px;
		background-color: coral;
	}
	.kiteData {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom:2rem;
	}
	.kiteData > h1 {
		margin:0;
		font-family: monospace;
	}
	.kiteData > p {
		font-size:0.8rem;
		line-height: 1.2rem;
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
		background-color: cornflowerblue;
		border-radius: 0.5rem;
	}
	.selected {
		border:solid 2px red;
	}
	.container {
		background-color: lightblue;
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
		height:1.8rem;
		display: flex;
		font-family: sans-serif;
		width:90%;
		align-items: space-between;
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
	dialog {
		width:88%;
		max-width:660px;
		height:88%;
		display:flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
	h1, h2 {
		font-family: sans-serif;
	}
	p {
		text-align: center;
		font-family: sans-serif;
	}
	canvas {
		pointer-events:all;
	}
</style>
