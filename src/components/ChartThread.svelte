<script lang="ts">
    import { _ } from 'svelte-i18n';
    import type { Thread } from '../model/Thread';
    
	export let thread: Thread;
</script>

<div class="thread" 
	uk-tooltip={$_("chart.tablet.color")}
	style="--backgroundColor: {thread.color}">
	<input type="color" bind:value={thread.color} aria-label={$_("chart.tablet.color")} />
</div>

<style>
	@media all {
		.thread {
			height: 1.3em;
			margin: 1px 0;
			background-color: var(--backgroundColor) !important;
		}
		input {
			width: 100%;
			height: 100%;
			padding: 0;
			margin: 0;
			border: 0;
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
	}
</style>
