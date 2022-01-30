<script lang="ts">
	import { _ } from "svelte-i18n";
	import { tablets, weaveRows, rotationDirections } from '../stores/stores.js';
	
	$: isActive = (i, j) => {
		return (typeof $rotationDirections[i] !== 'undefined') && (typeof $rotationDirections[i][j] !== 'undefined') && ($rotationDirections[i][j] === true);
	};
	
	const resetDirections = () => {
		$rotationDirections = {};
	}
	
	const changeDirectionForRow = (row: number) => {
		$tablets.forEach((element, column) => {
			changeDirectionForCell(row, column);
		});
	}
	
	const changeDirectionForCell = (row: number, column: number) => {
		if (typeof $rotationDirections[row] === 'undefined') {
			$rotationDirections[row] = {};
		}
		if ($rotationDirections[row][column]) {
			delete $rotationDirections[row][column];
			$rotationDirections = $rotationDirections;
		} else {
			$rotationDirections[row][column] = true;
		}
	}
</script>

<table>
	<tr uk-sticky>
		<th>
			<button class="resetDirections" type="button" 
				on:click={resetDirections}
				uk-icon="icon: trash; ratio: 0.7" 
				uk-tooltip={$_('preview.patternDevelopment.reset')}></button>
		</th>
		{#each $tablets as tablet, j (j)}
			<th>{j + 1}</th>
		{/each}
	</tr>
	{#each [...Array($weaveRows).keys()] as row, i (i)}
		<tr>
			<th class="uk-text-right">
				<button type="button" on:click={() => changeDirectionForRow(i)}
					uk-tooltip={$_('preview.patternDevelopment.switchAll')}>{i + 1}</button>
			</th>
			{#each $tablets as tablet, j (j)}
				<td class="{isActive(i, j) ? 'active' : ''}">
					<button type="button" class="cellLink" on:click={() => changeDirectionForCell(i, j)}
						uk-tooltip={$_('preview.patternDevelopment.index', { values: { column: (j+1), row: (i+1) } })} >&nbsp;</button>
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	@media all {
		table {
			border: 1px solid black;
			border-collapse: collapse;
		}
		tr {
			background-color: #FFFFFF;
			padding: 0 1px;
		}
		th, td {
			min-width: 12px;
			height: 18.7px;
			border: 1px solid #999999;
			line-height: 1.3em;
			font-size: 10px;
			color: #333333;
		}
		th {
			border-top: 0px;
			border-left: 0px;
		}
		.cellLink {
			display: block;
			width: 100%;
			height: 18px;
			color: transparent !important;
		}
		.active {
			background-color: #CCCCCC !important;
		}
		button {
			display: inline;
			border: 0;
			background-color: transparent;
			padding: 0;
			margin: 0;
		}
	}
	
	@media print {
		.resetDirections {
			display: none;
		}
	}
</style>
