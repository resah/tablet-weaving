<script lang="ts">
    import { _, locale, locales } from 'svelte-i18n';
	import { appStorage } from '../stores/Storage';
	import { regions, techniques, templates } from '../stores/patternTemplates';
	import PatternSelectionSlide from './PatternSelectionSlide.svelte';
	
    const handleLocaleChange = (selectedLocale: string) => {
	    locale.set(selectedLocale);
    };
</script>

<div id="pattern-selection" data-testid="pattern-selection-modal" uk-modal class="uk-modal uk-modal-container" class:uk-open="{$appStorage.tablets.length == 0}">
    <div class="uk-modal-dialog">
        <button class="uk-modal-close-default" type="button" uk-close aria-label={$_('selection.close')}></button>
        <div class="uk-modal-header">
            <h2 class="uk-modal-title">
            	{$_('selection.pattern')}
            	<span class="language-selection">
					{#each $locales as l}
		        		{#if $locale != l}
			            	<button type="button" class="uk-button uk-button-link" uk-icon="icon: world" data-testid="switch-locale-{l}" on:click={() => handleLocaleChange(l)}>
								{$_('lang', { locale: l })}
							</button>
		        		{/if}
					{/each}
				</span>
        	</h2>
        </div>
        <div class="uk-modal-body">

			<p class="uk-text-light">{$_('selection.description')}</p>

			<div uk-filter="target: .js-filter">
			
				<!-- Start: Filter -->
			    <div class="uk-grid-small uk-grid-divider uk-child-width-auto uk-margin-small-bottom" uk-grid>
			    	<div class="uk-text-small">{$_('selection.filter.label')}</div>
			        <div>
			            <ul class="uk-subnav uk-subnav-pill">
			                <li class="uk-active" uk-filter-control>
			                	<a href="#" aria-label="{$_('selection.filter.all')}">{$_('selection.filter.all')}</a>
			                </li>
			            </ul>
			        </div>
			        <div>
			            <ul class="uk-subnav uk-subnav-pill">
			            	{#each $techniques as technique, index (index)}
			            		{#if technique.length > 0}
				                	<li uk-filter-control="filter: [data-technique='{technique}']; group: data-technique"><a href="#" aria-label="{technique}">{technique}</a></li>
				                {/if}
			                {/each}
			            </ul>
			        </div>
			        <div>
			            <ul class="uk-subnav uk-subnav-pill">
			            	{#each $regions as region, index (index)}
			            		{#if region.length > 0}
				                	<li uk-filter-control="filter: [data-region='{region}']; group: data-region"><a href="#" aria-label="{region}">{region}</a></li>
				                {/if}
			                {/each}
			            </ul>
			        </div>
			    </div>
			    <!-- End: Filter -->

				<!-- Start: Slider -->
				<div class="uk-visible-toggle" uk-slider="autoplay: false">
					<div class="uk-position-relative">
						<div class="uk-slider-container uk-background-primary-light">
							<ul class="js-filter uk-slider-items uk-child-width-1-1">
							
								{#each $templates as template, index (index)}
									<PatternSelectionSlide index={index} template={template} />
								{/each}
							</ul>
						</div>
						<div class="uk-hidden@l uk-dark">
							<button type="button" class="uk-position-top-left uk-position-small" uk-slidenav-previous uk-slider-item="previous" aria-label={$_('selection.previous')}></button>
							<button type="button" class="uk-position-top-right uk-position-small" uk-slidenav-next uk-slider-item="next" aria-label={$_('selection.next')}></button>
						</div>
						<div class="uk-visible@l uk-dark">
							<button type="button" class="uk-position-center-left uk-slidenav-large" uk-slidenav-previous uk-slider-item="previous" aria-label={$_('selection.previous')}></button>
							<button type="button" class="uk-position-center-right uk-slidenav-large" uk-slidenav-next uk-slider-item="next" aria-label={$_('selection.next')}></button>
						</div>
					</div>
				</div>
				<!-- End: Slider -->
				
			</div>

        </div>
        <!--
        <div class="uk-modal-footer uk-text-right">
            <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
            <button class="uk-button uk-button-primary" type="button">Save</button>
        </div>
        -->
        
    </div>
</div>

<style>
	.uk-open {
		display: block;
	}
	.uk-subnav > * {
		padding-left: 15px;
	}
	.uk-subnav li a {
		font-size: 0.75em;
	}
	.uk-subnav-pill > * > :first-child {
		padding: 2px 5px;
	}
	.uk-grid-divider.uk-grid-small > :not(.uk-first-column)::before {
		left: 15px;
	}
	.language-selection {
		font-size: 0.8em;
		border-left: 1px solid #e5e5e5;
		margin-left: 10px;
		padding-left: 10px;
	}
	.language-selection > * {
		color: #666;
	}
</style>
