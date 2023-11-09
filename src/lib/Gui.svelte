<script>
    export let score = 0
    export let level = 0
    export let hitObstacle = false
    export let hitBonus = false
    export let viewportHeight, viewportWidth
</script>

<!-- <section class="debug">
    <h1>Level:{level}</h1>
    <h1>Score:{Math.round(score)}</h1>
    <p
        style:background-color={hitObstacle ? "red" : "antiquewhite"}
        style:color={hitObstacle ? "white" : "black"}
    >obstacle hit:{hitObstacle}</p>
    <p
        style:background-color={hitBonus ? "forestgreen" : "antiquewhite"}
        style:color={hitBonus ? "white" : "black"}
    >bonus hit:{hitBonus}</p>
</section> -->
<section class="score">
    <h1
        style:font-size={viewportWidth > 800 ? "3rem" : "1rem"}
    >
        {#each Array(7-Math.round(score).toLocaleString().length) as _ }
            <span
                style:text-shadow={viewportWidth > 800 ? "4px 4px #051519" : "2px 2px #051519"}
            >0</span>
        {/each}
        <span 
            style:margin-left={viewportWidth > 800 ? "-0.6rem" : "-0.4rem"}
            style:text-shadow={viewportWidth > 800 ? "4px 4px #051519" : "2px 2px #051519"}
            >{Math.round(score)}</span>
    </h1>
</section>

<style>
    section {
        width:100%;
        height:100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        pointer-events: none;
        position: absolute;
    }
    .debug {
        /* display:none; */
    }
    .score {
        align-items: flex-start;
        font-family: 'Bungee', sans-serif;
        color:#eeeeee;
    }
    h1 {
        font-size: 2rem;
        margin:0;
    }
    .score > h1 {
        margin-left:2rem;
        font-size: 3rem;
    }
    p {
        margin:0;
        background-color: antiquewhite;
        font-size: 1rem;
        padding:0.2rem;
    }
</style>
