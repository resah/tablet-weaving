<script lang="ts">
    import Thread from "./Thread.svelte";
    
    export let config;
	
	function toggleDirection() {
		config.sDirection = !config.sDirection;
	}
    
</script>

<div class="tablet">
	{#each config.threads as thread, index (index)}
		<Thread bind:config={thread}/>
	{/each}
	<div class="threadDirection">
		<button class="uk-button uk-button-default" on:click={toggleDirection}>
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
		width: 41px;
		height: 200px;
		float: left;
	}
	.threadDirection {
		width: 41px;
		height: 40px;
		background-color: lightgray;
	}
	.threadDirection button {
		padding: 0 16px;
	}
</style>