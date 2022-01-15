<script lang="ts">
	import { tablets, weaveRows, rotationDirections } from '../stores.js';
	
	$: isActive = (i, j) => {
		return (typeof $rotationDirections[i] !== 'undefined') && (typeof $rotationDirections[i][j] !== 'undefined') && ($rotationDirections[i][j] === true);
	};
	
	function changeDirectionForRow(row) {
		$tablets.forEach((element, column) => {
			changeDirectionForCell(row, column);
		});
	}
	
	function changeDirectionForCell(row, column) {
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

<div class="uk-flex uk-flex-center">
	<table>
		<tr>
			<th></th>
			{#each $tablets as tablet, j (j)}
				<th>{j + 1}</th>
			{/each}
		</tr>
		{#each [...Array($weaveRows).keys()] as row, i (i)}
			<tr>
				<th class="uk-text-right">
					<a on:click={() => changeDirectionForRow(i)} uk-tooltip="Drehrichtung für alle Brettchen umkehren">{i + 1}</a>
				</th>
				{#each $tablets as tablet, j (j)}
					<td class="{isActive(i, j) ? 'active' : ''}">
						<a class="cellLink" on:click={() => changeDirectionForCell(i, j)} uk-tooltip="Drehrichtung für Brettchen umkehren"></a>
					</td>
				{/each}
			</tr>
		{/each}
	</table>
</div>

<style>
	table {
		border: 1px solid black;
		border-collapse: collapse;
	}
	th, td {
		width: 20px;
		height: 15px;
		border: 1px solid black;
		line-height: 0.8em;
	}
	th {
		padding: 0 5px;
	}
	.cellLink {
		display: block;
		width: 28px;
		height: 18px;
	}
	.active {
		background-color: #CCCCCC;
	}
</style>