<script lang="ts">
    import { _ } from 'svelte-i18n';
	import { appStorage } from '../stores/Storage';
    import { Tablet } from '../model/Tablet';
    import { Thread } from '../model/Thread';
    import ChartSummary from './ChartSummary.svelte';
    import ChartTablet from './ChartTablet.svelte';
    
	const addTablet = () => {
		appStorage.update(a => {
			const lastTablet = a.tablets[a.tablets.length - 1];
			const newTablet = new Tablet(
				lastTablet.sDirection, 
				4, 
				lastTablet.threads.map(hole => {
					return new Thread(hole.color);
				})
			);
			a.tablets.push(newTablet);
			return a;
		});
	}
	
	const removeTablet = () => {
		if ($appStorage.tablets.length > 1) {
			appStorage.update(a => {
				a.tablets.pop();
				return a;
			});
		}
	}
	
</script>

<div class="uk-section uk-section-xsmall uk-section-muted threadingChart">
	<div class="uk-container uk-container-small uk-container-expand">
		<h2>{$_('chart.title')}</h2>
		
		<div class="uk-flex uk-flex-around uk-flex-wrap uk-flex-middle">
			<div>
				<img src="assets/tablet-4-holes.svg"
					alt={$_('chart.tablet.holes')}
					uk-tooltip={$_('chart.tablet.holes')} />
			</div>
		    
			<div class="uk-flex uk-flex-center uk-flex-row uk-flex-auto">
		    	<div class="holes uk-flex-auto">
		        	{#each $appStorage.tablets[0].threads as _, index (index)}
		        		<div class="holeIndex">
		        			{String.fromCharCode(65 + index)}
		        		</div>
		    		{/each}
				</div>
		
				{#each $appStorage.tablets as tablet, index (index)}
					<ChartTablet index={index} bind:tablet/>
				{/each}
			</div>
			
		    <div>
		    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" 
		    		on:click|preventDefault={addTablet}
		    		uk-tooltip={$_('chart.tablet.add')}></button><br>
		    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" 
		    		on:click|preventDefault={removeTablet}
		    		uk-tooltip={$_('chart.tablet.remove')}></button>
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
