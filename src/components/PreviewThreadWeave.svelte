<script lang="ts">
	import type { Weave } from '../model/Weave';
	import { hoverColumn, hoverRow } from '../stores/previewHover';

	export let tabletIndex: number;
	export let weaveRow: number;
	export let weave: Weave;
	
	const hover = (row: number, column: number) => {
		$hoverRow = row;
		$hoverColumn = column;
	}
</script>

<use href="#baseWeave" 
	class="weave"
	width=5
	height=20
	x={ tabletIndex * 5 + 10 } 
	y={ weaveRow * 10 } 
	fill={ weave.color }
	transform="scale({weave.sDirection ? 1 : -1},1)"
	transform-origin="{(tabletIndex * 5 + 10) + 2.5} 0"
	data-testid="preview-thread-weave"
	
	class:hover="{ $hoverColumn == weaveRow || $hoverRow == tabletIndex }"
	on:mouseover={() => hover(tabletIndex, weaveRow)}
	on:focus={() => hover(tabletIndex, weaveRow)}
	on:mouseout={() => hover(-1, -1)}
	on:blur={() => hover(-1, -1)}
	 />
