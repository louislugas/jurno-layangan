<script>
    import { onMount } from "svelte";    
    // export let lose = false
    let gameover

    onMount(() => {
        setTimeout(() => {
            gameover.style.opacity = 1
        }, 200)
    })
</script>

<section bind:this={gameover}>
    <h1>GAME OVER</h1>
</section>

<style>
    section {
        width:100%;
        height:100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        position: absolute;
        background-color:rgba(25, 50, 53, 0.807);
        opacity:0;
        transition:opacity 500ms ease-in-out;
    }
    h1 {
        font-size: 3rem;
        margin:0;
        margin-top:1rem;
        font-family: 'Bungee', sans-serif;
        color:#eeeeee;
        text-shadow: 4px 4px #051519;
    }
</style>
