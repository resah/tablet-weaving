<script lang="ts">
	import { tablets, weaveRows, rotationDirections, instructions, switchInstructions } from '../stores.js';
	
	$: isActive = (i, j) => {
		return (typeof $rotationDirections[i] !== 'undefined') && (typeof $rotationDirections[i][j] !== 'undefined');
	};
	
	function changeDirection(index) {
		if ($rotationDirections.includes(index)) {
			$rotationDirections = $rotationDirections.filter(it => it !== index);
		} else {
			$rotationDirections.push(index);
			$rotationDirections = $rotationDirections;
		}
	}
	
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

<div>
<table>
	<tr>
		<th></th>
		{#each $tablets as tablet, j (j)}
			<th>{String.fromCharCode(65 + j)}</th>
		{/each}
	</tr>
	{#each [...Array($weaveRows).keys()] as row, i (i)}
		<tr>
			<td class="uk-text-right">
				<a on:click={() => changeDirectionForRow(i)}>{i + 1}</a>
			</td>
			{#each $tablets as tablet, j (j)}
				<td class="{isActive(i, j) ? 'active' : ''}">
					<a class="cellLink" on:click={() => changeDirectionForCell(i, j)}></a>
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
		height: 20px;
		border: 1px solid black;
		padding: 0 5px;
		line-height: 1em;
	}
	.cellLink {
		display: block;
		width: 20px;
		height: 20px;
	}
	.active {
		background-color: #CCCCCC;
	}
</style>