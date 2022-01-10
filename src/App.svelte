<script lang="ts">
	import { tablets, weaves, weavesBack, weaveRows, rotationDirections, instructions } from './stores.js';
    import Tablet from "./components/Tablet.svelte";
    import TabletWeave from "./components/TabletWeave.svelte";
    
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
		if ($tablets.length > 1 && $tablets.length < 26) {
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
			<h2>Schärbrief</h2>
			<div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-middle" uk-grid>
				<div></div>
			    <div class="uk-width-auto">
		        
		        	<div class="holes">
		        		<div class="holeIndex"></div>
			        	{#each $tablets[0].threads as holes, index (index)}
			        		<div class="holeIndex">
			        			{String.fromCharCode(65 + index)}
			        		</div>
		        		{/each}
	        		</div>
	        		
					{#each $tablets as tablet, index (index)}
						<Tablet index={index} bind:config={tablet}/>
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
			    <div class="uk-first-column uk-text-center">
			    	<h3>Webbrief</h3>
			    </div>
			    <div class="uk-text-center uk-margin-medium-bottom">
			    	<h3>Vorderseite</h3>
			    </div>
			    <div class="uk-text-center">
			    	<h3>Rückseite</h3>
			    </div>
			    
			    <div class="uk-first-column uk-text-small">
			    	<ol>
				    	{#each $instructions as instruction, index (index)}
				    		<li>Brettchen 1 bis {$tablets.length}: <a on:click={() => changeDirection(index)}>{instruction ? 'vorwärts' : 'rückwärts'}</a></li>
						{/each}
					</ol>
			    </div>
			    <div class="uk-margin-medium-top">
		        
	        		<div>
		        		<div class="uk-text-small" style="width: 25px; float: left; text-align: right; padding-right: 5px; margin-top: -25px;">
				        	{#each [...Array($weaveRows).keys()] as key, index (index)}
				        		<a class="b" style="height: 17px; padding-top: 3.6px; display:block;" on:click={() => changeDirection(index)}>{index + 1}</a>
							{/each}
		        		</div>
		        		
						{#each $weaves as tablet, index (index)}
							<TabletWeave config={tablet}/>
						{/each}
					</div>
						
			    </div>
			    <div class="uk-margin-medium-top">
			    
			    	<div>
						{#each $weavesBack as tablet, index (index)}
							<TabletWeave config={tablet}/>
						{/each}
					</div>
			    
			    </div>
			    
			    <div class="uk-first-column"></div>
			    <div class="uk-margin-medium-top">
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" on:click|preventDefault={addWeaveRow}></button>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" on:click|preventDefault={removeWeaveRow}></button>
			    </div>
			    <div></div>
		    </div>
		</div>
	</div>
	
</main>

<style>
	.holes {
		width: 41px;
		height: 200px;
		float: left;
	}
	.holeIndex {
		width: 20px;
		height: 20px;
		margin: 1px;
		padding: 10px;
		background-color: white;
		text-align: center;
	}
</style>
