<script lang="ts">
    import * as animateScroll from "svelte-scrollto";
	import { tablets, weaves, weavesBack, weaveRows, rotationDirections, instructions } from './stores.js';
    import Tablet from "./components/Tablet.svelte";
    import Weave from "./components/Weave.svelte";
    import Instructions from "./components/Instructions.svelte";
    
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
		animateScroll.scrollToBottom();
	}
	
	function removeWeaveRow(event) {
		$weaveRows = $weaveRows - 1;
	}
</script>

<main>

	<div class="uk-section uk-section-xsmall uk-section-muted">
		<div class="uk-container uk-container-small uk-container-expand">
			<h2>Schärbrief</h2>
			<div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-3 uk-flex-center uk-flex-middle" uk-grid>
				<div>
					<img src="assets/tablet-4-holes.svg" alt="Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back"/>
				</div>
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
			
			<div class="uk-grid-column-small uk-grid-row-small uk-child-width-1-3 uk-flex-center uk-flex-top" uk-grid>
			
				<!-- First row -->
			    <div class="uk-first-column uk-text-center">
			    	<h3>Webbrief</h3>
			    </div>
			    <div class="uk-text-center uk-margin-medium-bottom">
			    	<h3>Vorderseite</h3>
			    </div>
			    <div class="uk-text-center">
			    	<h3>Rückseite</h3>
			    </div>
			    
			    <!-- Second row -->
			    <div class="uk-first-column uk-text-small">
					<Instructions />
			    </div>
			    <div class="uk-margin-medium-top">
		        	<Weave weavePattern={$weaves}/>
			    </div>
			    <div class="uk-margin-medium-top">
			    	<Weave weavePattern={$weavesBack}/>
			    </div>
			    
			    <!-- Third row -->
			    <div class="uk-first-column"></div>
			    <div class="uk-margin-medium-top">
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="plus" on:click|preventDefault={addWeaveRow}></button>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="minus" on:click|preventDefault={removeWeaveRow}></button>
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
