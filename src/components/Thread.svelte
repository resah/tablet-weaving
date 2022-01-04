<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let tablet;
	export let hole;
	export let bgColor = generateRandomColor();
	export let sDirection = true;
	
	let styles = { 'bg': bgColor };
	$: cssVarStyles = Object.entries(styles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
		
	function generateRandomColor() {
	    let maxVal = 0xFFFFFF; // 16777215
	    let randomNumber = Math.random() * maxVal; 
	    randomNumber = Math.floor(randomNumber);
	    randomNumber = randomNumber.toString(16);
	    let randColor = randomNumber.padStart(6, 0);   
	    return `#${randColor.toUpperCase()}`
	}
	
	function toggleDirection() {
		sDirection = !sDirection;
		dispatch('updateThread', {
			tablet: tablet,
			hole: hole,
			bgColor: bgColor,
			sDirection: sDirection
		});
	}
	
	function setColor(event) {
		dispatch('updateThread', {
			tablet: tablet,
			hole: hole,
			bgColor: bgColor,
			sDirection: sDirection
		});
	}
</script>

<div class="thread" style={cssVarStyles} on:click={toggleDirection}>
	<input type="color" bind:value={styles['bg']} class:sDirection on:click|stopPropagation on:change={setColor}/> 
</div>

<style>
	.thread {
		width: 50px;
		height: 50px;
		background-color: var(--bg, lightgray);
	}
	
	input {
		width: 20px;
		height: 20px;
		padding: 0;
		margin: 15px;
		border-width: 2px;
		border-radius: 0;
		border-color: #FFF #FFF #000 #000;

		-moz-transform: skewY(-40deg);
	    -webkit-transform: skewY(-40deg);
	    -o-transform: skewY(-40deg);
	    -ms-transform: skewY(-40deg);
	    transform: skewY(-40deg);
	}
	
	.sDirection {
		-moz-transform: skewY(40deg);
	    -webkit-transform: skewY(40deg);
	    -o-transform: skewY(40deg);
	    -ms-transform: skewY(40deg);
	    transform: skewY(40deg);
	}
</style>