<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStorage } from '../stores/Storage';
	
	$: isActive = (i: number, j: number) => {
		return (typeof $appStorage.rotationDirections[i] !== 'undefined') && (typeof $appStorage.rotationDirections[i][j] !== 'undefined') && ($appStorage.rotationDirections[i][j] === true);
	};
	
	const resetDirections = () => {
		$appStorage.rotationDirections = {};
	}
	
	const changeDirectionForRow = (row: number) => {
		$appStorage.tablets.forEach((_, column) => {
			changeDirectionForCell(row, column);
		});
	}
	
	const changeDirectionForCell = (row: number, column: number) => {
		if (typeof $appStorage.rotationDirections[row] === 'undefined') {
			$appStorage.rotationDirections[row] = {};
		}
		if ($appStorage.rotationDirections[row][column]) {
			delete $appStorage.rotationDirections[row][column];
			$appStorage.rotationDirections = $appStorage.rotationDirections;
		} else {
			$appStorage.rotationDirections[row][column] = true;
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
		{#each $appStorage.tablets as _, j (j)}
			<th>{j + 1}</th>
		{/each}
	</tr>
	{#each [...Array($appStorage.weaveRows).keys()] as row, i (i)}
		<tr>
			<th class="uk-text-right">
				<button type="button" on:click={() => changeDirectionForRow(i)}
					uk-tooltip={$_('preview.patternDevelopment.switchAll')}>{i + 1}</button>
			</th>
			{#each $appStorage.tablets as tablet, j (j)}
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
