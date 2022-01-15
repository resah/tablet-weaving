<script lang="ts">
	import { tablets, weavesFront, weavesBack, weaveRows, initStores, templates } from './stores.js';
	import { onMount } from 'svelte';
    import * as animateScroll from "svelte-scrollto";
    import Tablet from "./components/Tablet.svelte";
    import Weave from "./components/Weave.svelte";
    import Instructions from "./components/Instructions.svelte";
    
	onMount(() => {
		initStores();
	});
	
	$: if (window.location.search) {
		initStores();
	}
    
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

	<nav class="uk-navbar-container" uk-navbar>
	    <div class="uk-navbar-center">
	        Brettchenweben
    	</div>
	    <div class="uk-navbar-right">
	        <ul class="uk-navbar-nav">
	            <li>
	                <a  href={'#'}>Vorlagen</a>
	                <div class="uk-navbar-dropdown">
	                    <ul class="uk-nav uk-navbar-dropdown-nav">
	                    	{#each $templates as template, index (index)}
		                        <li><a href="?{(new Date()).getTime()}#{template.hash}">{template.name}</a></li>
                        	{/each}
	                    </ul>
	                </div>
	            </li>
	        </ul>
	    </div>
	</nav>


	<div class="uk-section uk-section-xsmall uk-section-muted">
		<div class="uk-container uk-container-small uk-container-expand">
			<h2>Schärbrief</h2>
			<div class="uk-grid-column-small uk-grid-row-large uk-child-width-1-6@m uk-flex-center uk-flex-middle" uk-grid>
				<div class="uk-text-center">
					<img src="assets/tablet-4-holes.svg" alt="Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back"/>
				</div>
			    <div class="uk-width-2-3 uk-text-center">
		        
					<div class="uk-flex uk-flex-center">
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
						
			    </div>
			    <div class="uk-text-center">
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom " uk-icon="plus" 
			    		on:click|preventDefault={addTablet}
			    		uk-tooltip="Brettchen hinzufügen"></button><br>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small" uk-icon="minus" 
			    		on:click|preventDefault={removeTablet}
			    		uk-tooltip="Brettchen entfernen"></button>
			    </div>
			</div>
		</div>
	</div>

	<div class="uk-section uk-section-xsmall">
		<div class="uk-container uk-container-small uk-container-expand">
			
			<div class="uk-grid-column-small uk-grid-row-small uk-child-width-1-3@m uk-flex-center uk-flex-top" uk-grid>
			
				<!-- First row -->
			    <div class="uk-first-column uk-text-center">
			    	<h3>Webbrief</h3>
			    </div>
			    <div class="uk-text-center uk-margin-small-bottom">
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
		        	<Weave weavePattern={$weavesFront}/>
			    </div>
			    <div class="uk-margin-medium-top">
			    	<Weave weavePattern={$weavesBack}/>
			    </div>
			    
			    <!-- Third row -->
			    <div class="uk-first-column"></div>
			    <div class="uk-margin-large-top uk-text-center">
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="plus" 
			    		on:click|preventDefault={addWeaveRow}
			    		uk-tooltip="Webreihe hinzufügen"></button>
			    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="minus" 
			    		on:click|preventDefault={removeWeaveRow}
			    		uk-tooltip="Webreihe entfernen"></button>
			    </div>
			    <div></div>
		    </div>
		</div>
	</div>
	
</main>

<style>
	.uk-navbar-nav > li > a {
		min-height: 50px;
	}

	.holes {
		width: 40px;
		margin-right: 2px;
	}
	.holeIndex {
		width: 20px;
		height: 20px;
		margin: 1px 0;
		padding: 10px;
		background-color: white;
		text-align: center;
	}
</style>
