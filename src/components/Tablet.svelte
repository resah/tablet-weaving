<script lang="ts">
    import Thread from "./Thread.svelte";
    
    export let index;
    export let config;
	
	function toggleDirection() {
		config.sDirection = !config.sDirection;
	}
    
</script>

<div class="tablet">
	<div class="tabletIndex uk-text-center" uk-tooltip="Brettchen #{index + 1}">
		{index + 1}
	</div>
	
	{#each config.threads as thread, index (index)}
		<Thread bind:config={thread}/>
	{/each}
	
	<div class="threadDirection">
		<button on:click={toggleDirection} uk-tooltip="Schärung umkehren">
			{#if config.sDirection}
			  S
			{:else}
			  Z
			{/if}
		</button> 
	</div>
</div>

<style>
	.tablet {
		width: 40px;
		border: 1px solid black;
		margin-right: 2px;
	}
	.tabletIndex {
		height: 30px;
		width: 40px;
		padding-top: 10px;
		background-color: white;
		border-bottom: 1px solid black;
	}
	.threadDirection {
		width: 40px;
		height: 40px;
		background-color: lightgray;
		border-top: 1px solid black;
	}
	.threadDirection button {
		padding: 0 16px;
		width: 40px;
		height: 40px;
		border: 0;
		background-color: lightgray;
	}
</style>