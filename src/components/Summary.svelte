<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
	import { tablets, weaveLength } from '../stores/stores.js';
    
    let showColors = false;
    
	const updateColor = (event, color) => {
		$tablets = $tablets.map((tablet: Tablet) => {
			tablet.threads = tablet.threads.map((thread) => {
				thread.color = thread.color.replace(color, event.target.value);
				return thread;
			});
			return tablet;
		});
	}
</script>

<div class="uk-text-center">
	{#if showColors}
    	<button type="button" class="uk-button uk-button-link" on:click={() => showColors = false}><span uk-icon="icon: chevron-down">Fadenübersicht</button>
	    <table class="uk-table uk-table-small uk-table-divider uk-background-default">
	    	<tr>
	    		<td></td>
	    		<td><input type="color" bind:value={$appConfig.weftColor} uk-tooltip="Schussfaden" class="weftColor" /><br></td>
	        	{#each $weaveLength as wl, index (index)}
	        		<td class="uk-text-right">
	        			{ wl.count } x <input type="color" uk-tooltip={wl.color} value={wl.color} on:change={(e) => updateColor(e, wl.color)} />
	        		</td>
	    		{/each}
	    	</tr>
	    	<tr>
	    		<td class="uk-text-left">Länge: <input class="uk-input uk-form-small uk-form-width-xsmall" type="text" bind:value={$appConfig.weaveLength} />cm</td>
	    		<td></td>
	        	{#each $weaveLength as wl, index (index)}
	        		<td class="uk-text-right">{wl.yarnLength}</td>
	    		{/each}
	    	</tr>
	    	<tr>
	    		<td class="uk-text-left uk-text-meta">
	    			Webzugabe: +20%<br>
	    			Zugabe Brettchen: +50cm
	    		</td>
	    		<td></td>
	        	{#each $weaveLength as wl, index (index)}
	        		<td class="uk-text-right uk-text-meta"></td>
	    		{/each}
	    	</tr>
	    </table>
	{:else}
		<button type="button" class="uk-button uk-button-link" on:click={() => showColors = true}><span uk-icon="icon: chevron-right">Fadenübersicht</button>
	{/if}
</div>

<style>
	@media all {
		input[type="color"] {
			border: 0;
			padding: 0;
			margin: 5px 0px 5px 10;
			border: 1px solid black;
			background-color: transparent;
		}
		input[type="color"]::-moz-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input[type="color"]::-webkit-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input.weftColor {
			border: 4px solid #AAAAAA !important;
		}
	}
</style>
