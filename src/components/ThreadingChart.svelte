<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
	import { tablets, patternColors } from '../stores/stores.js';
    import Tablet from "./Tablet.svelte";
    
    let showColors = false;
    
	const addTablet = (event) => {
		tablets.update(t => {
			const lastTablet = t[t.length - 1];
			const newTablet: Tablet = {
				sDirection: lastTablet.sDirection, 
				holes: 4,
				threads: lastTablet.threads.map(hole => {
					return { color: hole.color };
				})
			};
			t.push(newTablet);
			return t;
		});
	}
	
	const removeTablet = (event) => {
		if ($tablets.length > 1) {
			tablets.update(t => {
				t.pop();
				return t;
			});
		}
	}
	
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

<div class="uk-flex uk-flex-around uk-flex-wrap uk-flex-middle">
	<div>
		<img src="assets/tablet-4-holes.svg" alt="Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back"/>
	</div>
    
	<div class="uk-flex uk-flex-center uk-flex-row uk-flex-auto">
    	<div class="holes uk-flex-auto">
        	{#each $tablets[0].threads as holes, index (index)}
        		<div class="holeIndex">
        			{String.fromCharCode(65 + index)}
        		</div>
    		{/each}
		</div>

		{#each $tablets as tablet, index (index)}
			<Tablet index={index} bind:tablet/>
		{/each}
	</div>		        
	
    <div>
    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" 
    		on:click|preventDefault={addTablet}
    		uk-tooltip="Brettchen hinzufügen"></button><br>
    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" 
    		on:click|preventDefault={removeTablet}
    		uk-tooltip="Brettchen entfernen"></button>
    </div>
</div>
<div class="uk-flex uk-flex-around uk-flex-wrap uk-flex-middle">
	<div></div>
	<div class="uk-flex uk-flex-center uk-flex-row uk-margin-small-top uk-flex-wrap uk-flex-wrap-around">
		{#if showColors}
			<div class="uk-width-1-1 uk-flex-auto">
			    <button type="button" class="uk-button uk-button-link" on:click={() => showColors = false}><span uk-icon="icon: chevron-down">Farbübersicht</button>
		    </div>
		    <div>
		    	<input type="color" bind:value={$appConfig.weftColor} uk-tooltip="Schussfaden" class="weftColor" />
		    </div>
        	{#each $patternColors as color, index (index)}
        		<div>
        			{ color.count } x <input type="color" uk-tooltip={color.color} value={color.color} on:change={(e) => updateColor(e, color.color)} />
        		</div>
    		{/each}
		{:else}
			<button type="button" class="uk-button uk-button-link" on:click={() => showColors = true}><span uk-icon="icon: chevron-right">Farbübersicht</button>
		{/if}
	</div>
	<div></div>
</div>

<style>
	.holes {
		margin-right: 2px;
		max-width: 50px;
		padding-top: 22px;
	}
	.holeIndex {
		height: 19px;
		margin: 1px 0;
		padding: 2px;
		background-color: white;
		text-align: center;
		border: 1px solid black;
	}
	
	input {
		border: 0;
		padding: 0;
		margin: 5px 10px 5px 0;
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
		border: 4px solid #AAAAAA;
	}
</style>
