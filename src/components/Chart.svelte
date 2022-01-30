<script lang="ts">
	import { tablets } from '../stores/stores.js';
    import ChartSummary from "./ChartSummary.svelte";
    import ChartTablet from "./ChartTablet.svelte";
    
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
	
</script>

<div class="uk-section uk-section-xsmall uk-section-muted threadingChart">
	<div class="uk-container uk-container-small uk-container-expand">
		<h2>Schärbrief</h2>
		
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
					<ChartTablet index={index} bind:tablet/>
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

		<ChartSummary />

	</div>
</div>

<style>
	@media all {
		.holes {
			margin-right: 2px;
			max-width: 50px;
			padding-top: 22px;
		}
		.holeIndex {
			height: 19px;
			margin: 1px 0;
			padding: 2px;
			background-color: white !important;
			text-align: center;
			border: 1px solid black !important;
		}
	}
	
	@media print {
	    img, button {
	      display: none;
	    }
	}
</style>
