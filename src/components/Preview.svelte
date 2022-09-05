<script lang="ts">
    import * as animateScroll from 'svelte-scrollto';
    import { _ } from 'svelte-i18n';
	import { appStorage } from '../stores/Storage';
	import { weavesFront, weavesBack } from '../stores/weaves';
    import PreviewInstructions from './PreviewInstructions.svelte';
    import PreviewWeave from './PreviewWeave.svelte';
    
    let hiddenInstructions = false;
    let hiddenWeaveBack = false;
	
	const addWeaveRow = () => {
		appStorage.update(a => {
			a.weaveRows = a.weaveRows + 1;
			return a;
		});
		animateScroll.scrollToBottom();
	}
	
	const removeWeaveRow = () => {
		appStorage.update(a => {
			a.weaveRows = a.weaveRows - 1;
			return a;
		});
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
				    		data-testid="preview-instructions-show"
				    		aria-label={$_('preview.patternDevelopment.show')}
				    		uk-icon="icon: thumbnails"
				    		uk-tooltip={$_('preview.patternDevelopment.show')}
				    		on:click={() => hiddenInstructions = false}></button>
			    	</li>
				</ul>
			</div>
		    <div class="uk-first-column uk-text-center" hidden={hiddenInstructions} data-testid="preview-instructions">
		    	<h3>
		    		{$_('preview.patternDevelopment.title')} 
		    		<button type="button"
		    			data-testid="preview-instructions-hide"
		    			aria-label={$_('preview.patternDevelopment.hide')}
		    			class="uk-button uk-button-link" 
			    		uk-tooltip={$_('preview.patternDevelopment.hide')}
		    			on:click={() => hiddenInstructions = true}><span class="uk-margin-small-right" uk-icon="shrink"></span></button>
	    		</h3>
		    </div>
		    <div class="uk-text-center uk-margin-small-bottom" data-testid="preview-front">
		    	<h3>{$_('preview.front.title')}</h3>
		    </div>
		    <div class="uk-text-center" hidden={hiddenWeaveBack} data-testid="preview-back">
		    	<h3>
		    		{$_('preview.back.title')}
		    		<button type="button"
		    			data-testid="preview-back-hide"
		    			aria-label={$_('preview.back.hide')} 
		    			class="uk-button uk-button-link" 
			    		uk-tooltip={$_('preview.back.hide')} 
		    			on:click={() => hiddenWeaveBack = true}><span class="uk-margin-small-right" uk-icon="shrink"></span></button>
	    		</h3>
		    </div>
			<div class="uk-flex-none">
				<ul class="uk-iconnav uk-iconnav-vertical">
				    <li hidden={!hiddenWeaveBack}>
				    	<button type="button"
				    		data-testid="preview-back-show"
				    		aria-label={$_('preview.back.show')}
				    		uk-icon="icon: grid"
				    		uk-tooltip={$_('preview.back.show')}
				    		on:click={() => hiddenWeaveBack = false}></button>
			    	</li>
				</ul>
			</div>
		</div>			    

	    <!-- Second row -->
	    <div class="uk-flex uk-flex-between uk-flex-top">
	    	<div class="uk-flex-none"></div>
		    <div class="scrollable" hidden={hiddenInstructions} data-test-instructions>
				<PreviewInstructions />
		    </div>
		    <div class="uk-margin-small-top scrollable" data-test-front-weave>
	        	<PreviewWeave weavePattern={$weavesFront}/>
		    </div>
		    <div class="uk-margin-small-top scrollable" hidden={hiddenWeaveBack} data-test-back-weave>
		    	<PreviewWeave weavePattern={$weavesBack}/>
		    </div>
		    <div class="uk-flex-none"></div>
	    </div>

	    <!-- Third row -->
	    <div class="uk-flex uk-flex-around uk-flex-top">
		    <div class="uk-first-column"></div>
		    <div class="uk-margin-small-top uk-text-center">
		    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="plus"
		    		data-testid="add-weave-row" 
		    		aria-label={$_('preview.rows.add')}
		    		on:click|preventDefault={addWeaveRow}
		    		uk-tooltip={$_('preview.rows.add')}></button>
		    	<button class="uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom" uk-icon="minus" 
		    		data-testid="remove-weave-row"
		    		aria-label={$_('preview.rows.remove')}
		    		on:click|preventDefault={removeWeaveRow}
		    		uk-tooltip={$_('preview.rows.remove')}></button>
		    </div>
		    <div></div>
	    </div>
	</div>
</div>

<style>
	.scrollable {
		padding: 10px 0 45px 0;
		display: contents;
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

