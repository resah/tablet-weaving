<script lang="ts">
	import { weaveRows } from '../stores.js';
    import TabletWeave from "./TabletWeave.svelte";
    
    export let weavePattern;
</script>

<div>
	<div class="uk-text-small" style="width: 25px; float: left; text-align: right; padding-right: 5px; margin-top: -25px;">
    	{#each [...Array($weaveRows).keys()] as key, index (index)}
    		<div class="b" style="height: 18px; padding-top: 3.6px; display:block;">
    			{index + 1}
    		</div>
		{/each}
	</div>
	
	{#each weavePattern as tablet, index (index)}
		<TabletWeave config={tablet}/>
	{/each}
</div>

<style>
</style>