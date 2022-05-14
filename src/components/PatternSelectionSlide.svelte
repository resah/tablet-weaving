<script lang="ts">
    import { _ } from 'svelte-i18n';
	import { templates } from '../stores/patternTemplates';

	export let index: number;
	export let template: any;
	
	const imageName = template.name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, "");
</script>

<li data-testid="pattern-selection-slide-{index}" data-technique="{template.technique}" data-region="{template.region}">
	<div class="uk-grid-collapse" uk-grid>
		<div class="uk-width-1-3@s uk-inline uk-margin-medium-bottom margin-remove-bottom-s">
		    <img src="assets/patterns/{imageName}.png" alt="{$_('selection.preview')}" data-testid="pattern-selection-slide-image">
		    <div class="uk-overlay uk-overlay-default uk-padding-small uk-dark uk-position-top uk-text-center">
		        <p>{(index+1)} / {$templates.length}</p>
		    </div>
		</div>
		<div class="uk-width-expand@s uk-flex uk-flex-middle">
			<div class="uk-padding uk-padding-remove-top uk-padding-remove-bottom uk-width-1-1 uk-height-1-1">
				<h3 class="uk-text-uppercase uk-h5 uk-letter-spacing-small uk-text-muted uk-text-bolder uk-margin-remove">
					{template.technique}&nbsp;
				</h3>
				<h2 class="uk-heading-small uk-margin-small-top">{template.name}</h2>
				<div>
					<table class="uk-table uk-table-small uk-table-responsive uk-text-light">
				    	{#if template.region}
				        <tr>
				            <td class="uk-table-shrink">{$_('selection.region.label')}</td>
				            <td class="uk-table-expand">{template.region}</td>
				        </tr>
				    	{/if}
				    	{#if template.century}
				        <tr>
				            <td class="uk-table-shrink">{$_('selection.century.label')}</td>
				            <td class="uk-table-expand">{$_('selection.century.value', { values: { century: template.century } })}</td>
				        </tr>
				    	{/if}
				    	{#if template.technique}
				        <tr>
				            <td class="uk-table-shrink">{$_('selection.technique.label')}</td>
				            <td class="uk-table-expand">{template.technique}</td>
				        </tr>
				    	{/if}
				    	{#if template.tablets}
				        <tr>
				            <td class="uk-table-shrink">{$_('selection.tablets.label')}</td>
				            <td class="uk-table-expand">{template.tablets}</td>
				        </tr>
				    	{/if}
					</table>
				</div>
				<a class="uk-button uk-button-default uk-text-uppercase uk-display-block uk-position-bottom-right confirmation-button" 
					href="?{(new Date()).getTime()}#{template.hash}"
					uk-icon="triangle-right">
					{$_('selection.confirm')}
				</a>
			</div>
		</div> 
	</div>
</li>

<style>
	.confirmation-button {
		margin-bottom: 1px;
	}
	@media (min-width: 640px) {
		.margin-remove-bottom-s {
			margin-bottom: 0 !important;
		}
	}
</style>
