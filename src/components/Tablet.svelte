<script lang="ts">
    import Thread from "./Thread.svelte";
    
    export let index;
    export let config;
	
	function toggleDirection() {
		config.sDirection = !config.sDirection;
	}
    
</script>

<div class="tablet">
	<div class="tabletIndex uk-text-center">
		{index + 1}
	</div>
	
	{#each config.threads as thread, index (index)}
		<Thread bind:config={thread}/>
	{/each}
	
	<div class="threadDirection">
		<button on:click={toggleDirection}>
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
		float: left;
		border: 1px solid black;
		margin-right: 2px;
	}
	.tabletIndex {
		height: 30px;
		width: 40px;
		padding-top: 10px;
		background-color: white;
	}
	.threadDirection {
		width: 40px;
		height: 40px;
		background-color: lightgray;
	}
	.threadDirection button {
		padding: 0 16px;
		width: 40px;
		height: 40px;
		border: 0;
		background-color: lightgray;
	}
</style>