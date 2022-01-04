<script lang="ts">
    import Tablet from "./components/Tablet.svelte";
	
	$: tablets = [];
	
	function addTablet(event) {
		tablets.push(tablets.length + 1);
		tablets = tablets;
	}
	
	function removeTablet(event) {
		tablets.pop();
		tablets = tablets;
	}
	
	function updateThread(event) {
		console.log(event);
	}
</script>

<main>
	<p>Brettchen: <button on:click={addTablet}>+</button> <button on:click={removeTablet}>-</button></p> 
	
	{#each tablets as tablet, index (index)}
		<Tablet id={index} on:updateThread={updateThread}/>
	{/each}
</main>
