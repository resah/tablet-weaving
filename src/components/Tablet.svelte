<script lang="ts">
    import Thread from "./Thread.svelte";
    
    export let id;
    let holes = [0, 1, 2, 3];
</script>

<div class="tablet">
	{#each holes as hole, index (index)}
		<Thread tablet={id} hole={index} on:updateThread/>
	{/each}
</div>

<style>
	.tablet {
		width: 50px;
		height: 160px;
		background-color: #BBBBBB;
		float: left;
	}
</style>