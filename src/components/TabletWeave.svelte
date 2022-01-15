<script lang="ts">
    import ThreadWeave from "./ThreadWeave.svelte";
    
    export let config;
    let final = {
		color: '#ffffff',
		sDirection: true
	};
</script>

<div class="tablet">
	{#each config.weaves as weave, index (index)}
		<ThreadWeave weave={weave}/>
	{/each}
	<ThreadWeave weave={final} classNames="final"/>
</div>

<style>
	.tablet {
		width: 14px;
		float: left;
	}
</style>