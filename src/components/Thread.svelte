<script lang="ts">
	export let config;
</script>

<div class="thread" style={`background-color: ${config.color}`}>
	<input type="color" bind:value={config.color} on:click/>
</div>

<style>
	.thread {
		width: 40px;
		height: 40px;
		margin: 1px 0;
	}
	input {
		width: 40px;
		height: 40px;
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
</style>
