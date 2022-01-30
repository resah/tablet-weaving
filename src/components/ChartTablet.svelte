<script lang="ts">
    import { _ } from "svelte-i18n";
    import ChartThread from "./ChartThread.svelte";
    
    export let index: number;
    export let tablet: Tablet;
	
	const toggleDirection = () => {
		tablet.sDirection = !tablet.sDirection;
	}
    
</script>

<div class="tablet uk-flex-auto">
	<div class="tabletIndex uk-text-center" uk-tooltip={$_("chart.tablet.index", { values: { index: index + 1 } })} >
		{#if index < 9}&nbsp;{/if}{index + 1}
	</div>
	
	{#each tablet.threads as thread, index (index)}
		<ChartThread bind:thread/>
	{/each}
	
	<div class="threadDirection">
		<button on:click={toggleDirection} uk-tooltip={$_("chart.tablet.switch")} >
			{#if tablet.sDirection}
			  S
			{:else}
			  Z
			{/if}
		</button> 
	</div>
</div>

<style>
	@media all {
		.tablet {
			border: 1px solid black;
			margin-right: 2px;
			max-width: 30px;
		}
		.tabletIndex {
			height: 20px;
			background-color: white;
			border-bottom: 1px solid black;
		}
		.threadDirection {
			height: 25px;
			background-color: lightgray;
			border-top: 1px solid black;
			text-align: center;
		}
		.threadDirection button {
			padding: 0;
			margin: 0;
			border: 0;
			background-color: lightgray;
			height: 100%;
			width: 100%;
		}
	}
</style>
