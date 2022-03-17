<script lang="ts">
    import { _ } from 'svelte-i18n';
	import { appConfig } from '../stores/appConfig';
	import { appStorage } from '../stores/Storage';
	import { weaveLength } from '../stores/stores';
    import type { Tablet } from '../model/Tablet';
    
    let showColors = false;
    
	const updateColor = (event: any, color: string) => {
		$appStorage.tablets = $appStorage.tablets.map((tablet: Tablet) => {
			tablet.threads = tablet.threads.map((thread) => {
				thread.color = thread.color.replace(color, event.target.value);
				return thread;
			});
			return tablet;
		});
	}
</script>

<div class="uk-flex uk-flex-around uk-flex-wrap uk-flex-middle uk-margin-small-top">
	<div></div>
	<div class="uk-text-center">
		{#if showColors}
	    	<button data-testid="summary-close" type="button" class="uk-button uk-button-link" on:click={() => showColors = false}>
	    		<span uk-icon="icon: chevron-down">{$_('chart.summary.title')}
    		</button>
		    <table class="uk-table uk-table-small uk-table-divider uk-background-default yarnLengths">
		    	<tr>
		    		<td></td>
		    		<td><input type="color" bind:value={$appConfig.weftColor} uk-tooltip={$_('chart.summary.weft')} class="weftColor" /><br></td>
		        	{#each $weaveLength.yarnLengths as wl, index (index)}
		        		<td class="uk-text-right">
		        			{ wl.count } x <input type="color" uk-tooltip={wl.color} value={wl.color}
		        				data-testid="chart-summary-update-color-{wl.color}" 
		        				on:change={(e) => updateColor(e, wl.color)} />
		        		</td>
		    		{/each}
		    	</tr>
		    	<tr>
		    		<td class="uk-text-left">{
		    			$_('chart.summary.length')}: <input class="uk-input uk-form-small uk-form-width-xsmall" type="text" bind:value={$appConfig.weaveLength} />cm
	    			</td>
		    		<td></td>
		        	{#each $weaveLength.yarnLengths as wl, index (index)}
		        		<td class="uk-text-right">{wl.yarnLength}</td>
		    		{/each}
		    	</tr>
		    </table>
		    <table class="uk-table uk-table-small uk-table-divider uk-background-default uk-text-left singleYarnLength">
		    	<tr>
		    		<td class="uk-text-meta">{$_('chart.summary.weaveAllowance')}: +20%</td>
		    		<td class="uk-text-meta">{$_('chart.summary.tabletAllowance')}: +50cm</td>
		    		<td class="uk-text-meta uk-text-right">= {$weaveLength.singleYarnLength}cm {$_('chart.summary.perThread')}</td>
		    	</tr>
		    </table>
		{:else}
			<button data-testid="summary-open" type="button" class="uk-button uk-button-link" on:click={() => showColors = true}>
				<span uk-icon="icon: chevron-right">{$_('chart.summary.title')}
			</button>
		{/if}
	</div>
	<div></div>
</div>

<style>
	@media all {
		input[type="color"] {
			border: 0;
			padding: 0;
			margin: 5px 0px 5px 10;
			border: 1px solid black;
			background-color: transparent;
		}
		input[type="color"]::-moz-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input[type="color"]::-webkit-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input.weftColor {
			border: 4px solid #AAAAAA !important;
		}
		
		.yarnLengths {
			margin-bottom: 0;
		}
		.singleYarnLength,
		.singleYarnLength td {
			margin-top: 0;
			padding-top: 0;
		}
	}
</style>
