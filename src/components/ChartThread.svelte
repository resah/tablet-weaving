<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { appConfig } from '../stores/appConfig';
    import type { Thread } from '../model/Thread';
    
    export let thread: Thread;
</script>

<div class="thread" 
	style="--backgroundColor: {thread.color}"
	uk-tooltip={$_("chart.tablet.color")}>
	
	{#if !$appConfig.enablePebbleWeave}
		<input type="color" class="no-border" bind:value={thread.color} aria-label={$_("chart.tablet.color")} />
	{:else}
		<button type="button"
			class="uk-button uk-button-default"
			style={`background-color: ${(thread.empty ? '#FFFFFF' : thread.color)}`}>
			{#if thread.empty}
			    ○
			{/if}
		</button>
		
		<div uk-dropdown="offset: -2;">
		    <ul class="uk-nav uk-dropdown-nav">
		        <li>
		        	<input class="uk-checkbox emptyThread" type="checkbox" bind:checked={thread.empty} /> {$_("chart.tablet.pebbleWeave")}
	        	</li>
		        <li class="uk-nav-header">{$_("chart.tablet.color")}</li>
		        <li><input type="color" bind:value={thread.color}/></li>
		    </ul>
		</div>
	{/if}

</div>

<style>
	@media all {
		.thread {
			height: 1.3em;
			margin: 1px 0;
			background-color: var(--backgroundColor) !important;
		}
		button {
			width: 100%;
			height: 100%;
			padding: 0;
			margin: 0;
			border: 0;
			border-radius: 0;
			font-weight: bold;
			line-height: 1em;
			background-color: #FFFFFF;
		}
		input[type="color"] {
			width: 100%;
			height: 30px;
			padding: 0;
			margin: 0;
			border: 1px solid black;
			border-radius: 0;
		}
		input[type="color"]::-moz-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input[type="color"]::-webkit-color-swatch {
			outline: none;
			border: 0 transparent;
		}
		input.no-border {
			border: 0;
		}
	}
</style>
