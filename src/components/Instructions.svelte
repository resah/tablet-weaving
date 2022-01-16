<script lang="ts">
	import { tablets, weaveRows, rotationDirections } from '../stores.js';
	
	$: isActive = (i, j) => {
		return (typeof $rotationDirections[i] !== 'undefined') && (typeof $rotationDirections[i][j] !== 'undefined') && ($rotationDirections[i][j] === true);
	};
	
	function resetDirections() {
		$rotationDirections = {};
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

<table>
	<tr uk-sticky>
		<th>
			<a href="javascript:void(0)" uk-icon="icon: trash; ratio: 0.7" on:click={resetDirections}></a>
		</th>
		{#each $tablets as tablet, j (j)}
			<th>{j + 1}</th>
		{/each}
	</tr>
	{#each [...Array($weaveRows).keys()] as row, i (i)}
		<tr>
			<th class="uk-text-right">
				<a href="javascript:void(0)" on:click={() => changeDirectionForRow(i)} uk-tooltip="Drehrichtung für alle Brettchen umkehren">{i + 1}</a>
			</th>
			{#each $tablets as tablet, j (j)}
				<td class="{isActive(i, j) ? 'active' : ''}">
					<a href="javascript:void(0)" class="cellLink" on:click={() => changeDirectionForCell(i, j)} uk-tooltip="Brettchen {j + 1},{i + 1}">x</a>
				</td>
			{/each}
		</tr>
	{/each}
</table>

<style>
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
		color: transparent;
	}
	.active {
		background-color: #CCCCCC;
	}
</style>
