<script lang="ts">
	export let weave;
	export let classNames = '';
</script>

<div class="weave {classNames}" class:sDirection={weave.sDirection} style={`background-color: ${weave.color}`}></div>

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
	.final {
		background-color: #FFFFFF;
		border-bottom: 0;
		border-left-color: #FFFFFF;
		border-right-color: #FFFFFF;
		height: auto;
	}
</style>