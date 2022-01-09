<script lang="ts">
    import ThreadWeave from "./ThreadWeave.svelte";
    
    export let config;
</script>

<div class="tablet">
	{#each config.weaves as weave, index (index)}
		<ThreadWeave weave={weave}/>
	{/each}
</div>

<style>
	.tablet {
		width: 14px;
		float: left;
	}
	.weaveInfo {
		width: 25px;
		float: left;
	}
</style>