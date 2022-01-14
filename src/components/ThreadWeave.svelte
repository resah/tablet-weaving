<script lang="ts">
	export let weave;
</script>

<div class="weave" class:sDirection={weave.sDirection} style={`background-color: ${weave.color}`}></div>

<style>
	.weave {
		width: 13px;
		height: 45px;
		margin-top: -25px;
		border: 1px solid #AAAAAA;
		
		transform: skew(0, -60deg);
	}
	.sDirection {
		transform: skew(0, 60deg);
	}
</style>