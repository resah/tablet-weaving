<script lang="ts">
	import { weaveRows, templates, appConfig } from '../stores/stores.js';
	import { weavesFront, weavesBack } from '../stores/weaves.js';
    import PreviewInstructions from "./PreviewInstructions.svelte";
    import PreviewWeave from "./PreviewWeave.svelte";
    
    let hiddenInstructions = false;
    let hiddenWeaveBack = false;
	
	const addWeaveRow = (event) => {
		$weaveRows = $weaveRows + 1;
		animateScroll.scrollToBottom();
	}
	
	const removeWeaveRow = (event) => {
		$weaveRows = $weaveRows - 1;
	}
</script>

<div class="uk-section uk-section-xsmall preview">
	<div class="uk-container uk-container-small uk-container-expand">
		
		<!-- First row -->
		<div class="uk-flex uk-flex-between uk-flex-top">
			<div class="uk-flex-none">
				<ul class="uk-iconnav uk-iconnav-vertical">
				    <li hidden={!hiddenInstructions}>
				    	<button type="button"
				    		uk-icon="icon: thumbnails"
				    		uk-tooltip="Webbrief anzeigen"  
				    		on:click={() => hiddenInstructions = false}></button>
			    	</li>
				</ul>
			</div>
		    <div class="uk-first-column uk-text-center" hidden={hiddenInstructions}>
		    	<h3>
		    		Webbrief 
		    		<button type="button"
		    			class="uk-button uk-button-link" 
		    			on:click={() => hiddenInstructions = true}><span class="uk-margin-small-right" uk-icon="shrink"></span></button>
	    		</h3>
		    </div>
		    <div class="uk-text-center uk-margin-small-bottom">
		    	<h3>Vorderseite</h3>
		    </div>
		    <div class="uk-text-center" hidden={hiddenWeaveBack}>
		    	<h3>
		    		Rückseite
		    		<button type="button"
		    			class="uk-button uk-button-link" 
		    			on:click={() => hiddenWeaveBack = true}><span class="uk-margin-small-right" uk-icon="shrink"></span></button>
	    		</h3>
		    </div>
			<div class="uk-flex-none">
				<ul class="uk-iconnav uk-iconnav-vertical">
				    <li hidden={!hiddenWeaveBack}>
				    	<button type="button"
				    		uk-icon="icon: grid"
				    		uk-tooltip="Rückseite des Webbandes anzeigen" 
				    		on:click={() => hiddenWeaveBack = false}></button>
			    	</li>
				</ul>
			</div>
		</div>			    

	    <!-- Second row -->
	    <div class="uk-flex uk-flex-between uk-flex-top">
	    	<div class="uk-flex-none"></div>
		    <div class="scrollable" hidden={hiddenInstructions}>
				<PreviewInstructions />
		    </div>
		    <div class="uk-margin-medium-top scrollable">
	        	<PreviewWeave weavePattern={$weavesFront}/>
		    </div>
		    <div class="uk-margin-medium-top scrollable" hidden={hiddenWeaveBack}>
		    	<PreviewWeave weavePattern={$weavesBack}/>
		    </div>
		    <div class="uk-flex-none"></div>
	    </div>

	    <!-- Third row -->
	    <div class="uk-flex uk-flex-around uk-flex-top">
		    <div class="uk-first-column"></div>
		    <div class="uk-margin-small-top uk-text-center">
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

<style>
	.scrollable {
		padding: 10px 0 45px 0;
		/*
		overflow-x: scroll;
		overflow-y: visible;
		*/
	}
	
	@media print {
		button {
			display: none;
		}
		.preview {
			page-break-inside: avoid;
		}
	}
</style>

