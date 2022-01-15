<script lang="ts">
	import { weaveRows } from '../stores.js';
    import TabletWeave from "./TabletWeave.svelte";
    
    export let weavePattern;
</script>

<div class="uk-flex uk-flex-center">

	<div class="tabletWeaveIndices uk-text-small">
    	{#each [...Array($weaveRows).keys()] as key, index (index)}
    		<div class="tabletWeaveIndex">
    			{index + 1}
    		</div>
		{/each}
	</div>
	
	{#each weavePattern as tablet, index (index)}
		<TabletWeave config={tablet}/>
	{/each}
	
</div>

<style>
	.tabletWeaveIndices {
		width: 25px;
		text-align: right;
		padding-right: 5px;
		margin-top: -25px;
	}
	.tabletWeaveIndex {
		height: 18px;
		padding-top: 3.7px;
	}
</style>
