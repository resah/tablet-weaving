<script lang="ts">
	import { tablets, weaves, weaveRows, rotationDirections } from './stores.js';
    import Tablet from "./components/Tablet.svelte";
    import TabletWeave from "./components/TabletWeave.svelte";
    
    let rotationDirection = true;
	
	function addTablet(event) {
		tablets.update(t => {
			const lastTablet = t[t.length - 1];
			const newTablet = {
				sDirection: lastTablet.sDirection, 
				threads: lastTablet.threads.map(hole => {
					return { color: hole.color };
				})
			};
			t.push(newTablet);
			return t;
		});
	}
	
	function removeTablet(event) {
		if ($tablets.length > 1) {
			tablets.update(t => {
				t.pop();
				return t;
			});
		}
	}
	
	function addWeaveRow(event) {
		$weaveRows = $weaveRows + 1;
	}
	
	function removeWeaveRow(event) {
		$weaveRows = $weaveRows - 1;
	}
	
	function changeDirection(index) {
		if ($rotationDirections.includes(index)) {
			$rotationDirections = $rotationDirections.filter(it => it !== index);
		} else {
			$rotationDirections.push(index);
			$rotationDirections = $rotationDirections;
		}
		console.log($rotationDirections);
	}
</script>

<main>

	<div class="uk-section uk-section-xsmall uk-section-muted">
		<div class="uk-container uk-container-small uk-container-expand">
			<h2>Webbrief</h2>
			<div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-middle" uk-grid>
				<div></div>
			    <div class="uk-width-auto">
		        
					{#each $tablets as tablet, index (index)}
						<Tablet bind:config={tablet}/>
					{/each}
						
			    </div>
			    <div>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" on:click|preventDefault={addTablet}></button><br>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" on:click|preventDefault={removeTablet}></button>
			    </div>
			</div>
		</div>
	</div>

	<div class="uk-section uk-section-xsmall">
		<div class="uk-container uk-container-small uk-container-expand">
			<h2>Vorschau</h2>
			
			<div class="uk-grid-column-small uk-grid-row-small uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-top" uk-grid>
			    <div class="uk-text-center">
			    	<h3>Anleitung</h3>
			    </div>
			    <div class="uk-width-auto uk-margin-medium-bottom">
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" on:click|preventDefault={addWeaveRow}></button>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" on:click|preventDefault={removeWeaveRow}></button>
			    </div>
			    <div class="uk-text-center">
			    	<h3>Rückseite</h3>
			    </div>
			    <div class="uk-text-small">
			    
			    	{#each [...Array($weaveRows).keys()] as key, index (index)}
		        		{#if $rotationDirections.includes(index)}
				    		{rotationDirection = !rotationDirection}
		        		{/if}
			    		{index+1}. {rotationDirection ? 'vorwärts' : 'rückwärts'}
		        		<br>
					{/each}
					
			    </div>
			    <div class="uk-width-auto uk-margin-medium-top">
		        
	        		<div class="uk-text-small" style="width: 25px; float: left; text-align: right; padding-right: 5px; margin-top: -25px;">
			        	{#each [...Array($weaveRows).keys()] as key, index (index)}
			        		<a class="b" style="height: 17px; padding-top: 3.6px; display:block;" on:click={() => changeDirection(index)}>{index + 1}</a>
						{/each}
	        		</div>
	        		
					{#each $weaves as tablet, index (index)}
						<TabletWeave config={tablet}/>
					{/each}
						
			    </div>
			    <div>
			    	
			    </div>
		    </div>
		</div>
	</div>
	
</main>
