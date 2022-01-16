<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
	import { weaveRows } from '../stores.js';
    import TabletWeave from "./TabletWeave.svelte";
    
    export let weavePattern;
</script>

<div class="uk-flex uk-flex-center">
	<div class="tabletWeaveIndices weaveSize{$appConfig.weaveSize} uk-text-small">
    	{#each [...Array($weaveRows).keys()] as key, index (index)}
    		<div class="tabletWeaveIndex {index % 2 ? 'even' : 'odd'}">
    			{index + 1}
    		</div>
		{/each}
	</div>
	
	{#each weavePattern as tablet, index (index)}
		<TabletWeave config={tablet} tabletIndex={index}/>
	{/each}
</div>

<style>
	.tabletWeaveIndices {
		width: 25px;
		text-align: right;
		padding-right: 5px;
		margin-top: -25px;
	}
	.weaveSize1 .tabletWeaveIndex {
		height: 14px;
		padding-top: 0;
	}
	.weaveSize2 .tabletWeaveIndex {
		height: 24px;
		padding-top: 0;
	}
	.weaveSize3 .tabletWeaveIndex {
		height: 18px;
		padding-top: 3.7px;
	}
	.weaveSize1 .even,
	.weaveSize2 .even {
		display: none;
	}
</style>
