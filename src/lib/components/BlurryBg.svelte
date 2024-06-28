<script lang="ts">
    let animDuration = 6;
</script>

<section class="bg-container">
    <div class="container">
        {#each Array.from({ length: 30 }) as _, i}
            <svg class="shape" viewBox="0 0 100 115" preserveAspectRatio="xMidYMin slice">
                {#each Array.from({ length: 4 }) as _, j}
                    <polygon points="" fill="none" stroke="hsl({320 - (j * 80)},100%,70%)" stroke-width="5">
                        <animate attributeName="points" repeatCount="indefinite" dur="{animDuration}s" begin="{j * animDuration/4}s" from="50 57.5, 50 57.5, 50 57.5" to="50 -75, 175 126, -75 126"></animate>
                    </polygon>
                {/each}
            </svg>
        {/each}

    </div>
</section>
<figure class="fade-to-black"></figure>


<style lang="scss">
    $cols: 4;
    $rows: 1;
    $cells: $cols * $rows;
    $bgcolor: #6223D2;
    $shapeSizeMod: 2;
    $shapeHeight: 500 * $shapeSizeMod;
    $shapeWidth: 400 * $shapeSizeMod;

    .bg-container {
        margin: 0;

        position: fixed;
        top:0;
        left:0;
        right:0;
        opacity: 0.2;

        filter: blur(50px);

    }

    .fade-to-black {
        position: fixed;
        top:0;
        left:0;
        right:0;
        bottom:0;
        background: linear-gradient(180deg, rgba(0,0,0,0) 40%, black 100%);
        mix-blend-mode: overlay;
    }


    //Container to provide grid layout for all items
    .container {
        display: grid;

        grid-template-columns: repeat($cols, $shapeWidth+px);
        grid-template-rows: repeat($rows, $shapeHeight+px);
        transform: translate(-3%, -4%); // Starting point bleeds off edge
    }

    //Invividual shapes
    .shape {
        width: $shapeWidth+px;
        height: $shapeHeight+px;
        //Create hexagon mask
        -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);

        //Snap hexagon together by moving each "row" up and over
        @for $i from 1 through $cells {
            @if $i > $cols {
                &:nth-child(#{$i}) {
                    transform: translate(-50%, -25%);
                }
            }
            @if $i > ($cols * 2) {
                &:nth-child(#{$i}) {
                    transform: translate(0%, -50%);
                }
            }
            @if $i > ($cols * 3) {
                &:nth-child(#{$i}) {
                    transform: translate(-50%, -75%);
                }
            }
            @if $i > ($cols * 4) {
                &:nth-child(#{$i}) {
                    transform: translate(0%, -100%);
                }
            }
            @if $i > ($cols * 5) {
                &:nth-child(#{$i}) {
                    transform: translate(-50%, -125%);
                }
            }
        }
    }


</style>
