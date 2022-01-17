<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
	import type { Weave } from '../model/weave.type';

	export let tabletIndex: number;
	export let weaveRow: number;
	export let weave: Weave;
	export let classNames: string = '';
</script>

<div class="weave weaveSize{$appConfig.weaveSize} {classNames}"
	uk-tooltip="{tabletIndex + 1}, {weaveRow + 1}" 
	class:sDirection={weave.sDirection} 
	style={`
		background-color: ${weave.color}; 
		border-color: ${$appConfig.weaveBorderColor};
	`}>
</div>

<style>
	.weave {
		margin-top: -25px;
		border: 1px solid #AAAAAA;
	}
	
	.weaveSize1 {
		width: 7px;
		height: 30px;
		transform: skew(0, -40deg);
	}
	.weaveSize1.sDirection {
		transform: skew(0, 40deg);
	}
	.weaveSize2 {
		width: 10px;
		height: 35px;
		transform: skew(0, -50deg);
	}
	.weaveSize2.sDirection {
		transform: skew(0, 50deg);
	}
	.weaveSize3 {
		width: 13px;
		height: 45px;
		transform: skew(0, -60deg);
	}
	.weaveSize3.sDirection {
		transform: skew(0, 60deg);
	}
	
	.final {
		background-color: #FFFFFF;
		border-left-color: #FFFFFF;
		border-right-color: #FFFFFF;
		border-bottom: 0;
		height: auto;
	}
</style>
