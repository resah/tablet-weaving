<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStorage } from '../stores/Storage';
	import { hoverColumn, hoverRow } from '../stores/previewHover';
	
	$: isActive = (i: number, j: number) => {
		return (typeof $appStorage.rotationDirections[i] !== 'undefined') && (typeof $appStorage.rotationDirections[i][j] !== 'undefined') && ($appStorage.rotationDirections[i][j] === true);
	};
	
	const resetDirections = () => {
		$appStorage.rotationDirections = {};
	}
	
	const changeDirectionForRow = (row: number) => {
		$appStorage.tablets.forEach((_, column) => {
			if (!$appStorage.locks[column]) {
				changeDirectionForCell(row, column);
			}
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
	
	const changeLockForColumn = (column: number) => {
		$appStorage.locks[column] = !$appStorage.locks[column];
	}
	
	const hover = (row: number, column: number) => {
		$hoverColumn = -1;
		$hoverRow = -1;
		if (column >= 0) {
			$hoverColumn = column;
		}
		if (row >= 0) {
			$hoverRow = row;
		}
	}
</script>

<table>
	<tr uk-sticky>
		<th>
			<button class="resetDirections" type="button" 
				data-testid="reset-directions"
				aria-label={$_('preview.patternDevelopment.reset')}
				on:click={resetDirections}
				uk-icon="icon: trash; ratio: 0.7" 
				uk-tooltip={$_('preview.patternDevelopment.reset')}></button>
		</th>
		{#each $appStorage.tablets as _, j (j)}
			<th 
				class:hover="{ $hoverColumn == j }"
				on:mouseover={() => hover(j, -1)}
				on:focus={() => hover(j, -1)}
				on:mouseout={() => hover(-1, -1)}
				on:blur={() => hover(-1, -1)}>{j + 1}</th>
		{/each}
	</tr>
	<tr>
		<td></td>
		{#each $appStorage.locks as lock, l (l)}
			<td 
				class:hover="{ $hoverColumn == l }"
				on:mouseover={() => hover(-1, l)}
				on:focus={() => hover(-1, l)}
				on:mouseout={() => hover(-1, -1)}
				on:blur={() => hover(-1, -1)}>
				{#if lock}
					<button type="button" on:click={() => changeLockForColumn(l)}
						uk-icon="icon: unlock" 
						aria-label={$_('preview.patternDevelopment.reset')}
						uk-tooltip={$_('preview.patternDevelopment.reset')}></button>
				{:else}
					<button type="button" on:click={() => changeLockForColumn(l)}
						uk-icon="icon: lock" 
						aria-label={$_('preview.patternDevelopment.reset')}
						uk-tooltip={$_('preview.patternDevelopment.reset')}></button>
				{/if}
			</td>
		{/each}
	</tr>
	{#each [...Array($appStorage.weaveRows).keys()] as row, i (i)}
		<tr>
			<th class="uk-text-right"
				class:hover="{ $hoverRow == i }"
				on:mouseover={() => hover(i, -1)}
				on:focus={() => hover(i, -1)}
				on:mouseout={() => hover(-1, -1)}
				on:blur={() => hover(-1, -1)}>
				<button type="button" on:click={() => changeDirectionForRow(i)}
					data-testid="toggle-directions-row-{i}"
					aria-label={$_('preview.patternDevelopment.switchAll')}
					uk-tooltip={$_('preview.patternDevelopment.switchAll')}>{i + 1}</button>
			</th>
			{#each $appStorage.tablets as tablet, j (j)}
				<td class:active="{ isActive(i, j) }"
					class:hover="{ $hoverColumn == j || $hoverRow == i }"
					class:lock="{ $appStorage.locks[j] }"
					on:mouseover={() => hover(i, j)}
					on:focus={() => hover(i, j)}
					on:mouseout={() => hover(-1, -1)}
					on:blur={() => hover(-1, -1)}>
					
					{#if $appStorage.locks[j]}
						<button type="button" class="cellLink" disabled
							data-testid="toggle-directions-cell-{i}-{j}"
							aria-label={$_('preview.patternDevelopment.index', { values: { column: (j+1), row: (i+1) } })}
							uk-tooltip={$_('preview.patternDevelopment.index', { values: { column: (j+1), row: (i+1) } })} >&nbsp;</button>
					{:else}
						<button type="button" class="cellLink" on:click={() => changeDirectionForCell(i, j)}
							data-testid="toggle-directions-cell-{i}-{j}"
							aria-label={$_('preview.patternDevelopment.index', { values: { column: (j+1), row: (i+1) } })}
							uk-tooltip={$_('preview.patternDevelopment.index', { values: { column: (j+1), row: (i+1) } })} >&nbsp;</button>
					{/if}
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
	@media all {
		table {
			border: 1px solid #333333;
			border-collapse: collapse;
		}
		tr {
			background-color: #FFFFFF;
			padding: 0 1px;
		}
		th, td {
			min-width: 1.2em;
			height: 1.5em;
			border: 1px solid #999999;
			line-height: 1.3em;
			font-size: 0.8em;
			color: #333333;
		}
		th {
			border-top: 0px;
			border-left: 0px;
		}
		.cellLink {
			display: block;
			width: 100%;
			height: 1.5em;
			color: transparent !important;
		}
		.active button {
			background-color: rgba(180, 180, 180, 0.75) !important;
		}
		.hover {
			background-color: rgba(255, 255, 200, 0.6) !important;
		}
		.lock {
			background-image: linear-gradient(
				45deg, rgba(255, 255, 255, 0.5) 18.18%, 
				rgba(200, 200, 200, 0.5) 18.18%, 
				rgba(200, 200, 200, 0.5) 50%, 
				rgba(255, 255, 255, 0.5) 50%, 
				rgba(255, 255, 255, 0.5) 68.18%, 
				rgba(200, 200, 200, 0.5) 68.18%, 
				rgba(200, 200, 200, 0.5) 100%);
			background-size: 11.00px 11.00px;
		}
		button {
			display: inline;
			border: 0;
			background-color: transparent;
			padding: 0;
			margin: 0;
		}
		button:disabled {
			cursor: default;
		}
		
		td:hover button.cellLink {
			border: 1px dashed black;
		}
	}
	
	@media print {
		.resetDirections {
			display: none;
		}
	}
</style>
