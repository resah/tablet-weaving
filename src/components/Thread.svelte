<script lang="ts">
	export let thread: Thread;
</script>

<div class="thread" 
	uk-tooltip="Farbe wählen"
	style={`background-color: ${thread.color}`} >
	<input type="color" bind:value={thread.color} />
</div>

<style>
	.thread {
		height: 25px;
		margin: 1px 0;
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
</style>
