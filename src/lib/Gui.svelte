<script>
    export let score = 0
</script>

<section>
    <h1>Score:{Math.round(score)}</h1>
</section>

<style>
    section {
        width:100%;
        height:100%;
        display: flex;
        /* align-items: center; */
        justify-content: center;
        pointer-events: none;
    }
    h1 {
        font-size: 2rem;
    }
</style>
