<script lang="ts">
	import { appConfig } from '../stores/appConfig';
	import { appStorage } from '../stores/Storage';
	import type { Weave } from '../model/Weave';
    import PreviewTabletWeave from './PreviewTabletWeave.svelte';
    
    export let weavePattern: Weave[][];
</script>

<svg xmlns="http://www.w3.org/2000/svg" 
	class="svg-pattern svg-pattern-{$appConfig.weaveSize}"
	viewBox="0 0 {$appStorage.tablets.length * 5 + 10} {$appStorage.weaveRows * 10 + 20}"
	data-testid="preview-weave">
	
    <symbol id="baseWeave" viewBox="0 0 0.25 1">
    	{#if $appConfig.showWeaveBorder }
    	    <path d="M 0,0 L 0.25,0.5 L 0.25,1 L 0,1 Z" stroke={$appConfig.weaveBorderColor} stroke-width="0.01" />
    	{:else}
	        <path d="M 0,0 L 0.25,0.5 L 0.25,1 L 0,1 Z" />
    	{/if}
    </symbol>
    <symbol id="inverseWeave" viewBox="0 0 0.25 1">
    	{#if $appConfig.showWeaveBorder }
    	    <path d="M 0.25,0 L 0.25,1 L 0,1 L 0,0.5 Z" stroke={$appConfig.weaveBorderColor} stroke-width="0.01" />
    	{:else}
	        <path d="M 0.25,0 L 0.25,1 L 0,1 L 0,0.5 Z" />
    	{/if}
    </symbol>
	<pattern id="pattern-checkers" x="0" y="0" width="0.2" height="0.2" patternUnits="userSpaceOnUse">
		<rect fill="#ffffff" x="0" y="0" width="0.2" height="0.2"></rect>
    	<rect fill="#bbbbbb" x="0" y="0" width="0.1" height="0.1"></rect>
    	<rect fill="#cccccc" x="0.1" y="0.1" width="0.1" height="0.1"></rect>
    </pattern>

	{#each weavePattern as tablet, index (index)}
		<PreviewTabletWeave weaves={tablet} tabletIndex={index}/>
	{/each}

	<g id="index-numbers" class="tabletWeaveIndices">
		{#each [...Array($appStorage.weaveRows).keys()] as _, index (index)}
			<text x="0" y={index * 10 + 7} font-size="0.25em" class="small tabletWeaveIndex">{index + 1}</text>
			<line x1="5" y1={index * 10 + 5.5} x2="8" y2={index * 10 + 5.5} stroke="#333333" stroke-width="0.2" />
			<line x1="5" y1={index * 10 + 6} x2="8" y2={index * 10 + 6} stroke="#FFFFFF" stroke-width="0.2" />

			<line x1="8" y1={index * 10 + 5.5} x2="12.5" y2={index * 10 + 9} stroke="#333333" stroke-width="0.2" />
			<line x1="8" y1={index * 10 + 6} x2="12.5" y2={index * 10 + 9.5} stroke="#FFFFFF" stroke-width="0.2" />
		{/each}
	</g>
</svg>

<style>
	.svg-pattern {
		margin-top: 1.5em;
		width: 15em;
	}
	.svg-pattern-1 {
		width: 5em;
	}
	.svg-pattern-2 {
		width: 10em;
	}
	.svg-pattern-4 {
		width: 20em;
	}
	.svg-pattern-5 {
		width: 25em;
	}
</style>
