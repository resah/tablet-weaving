<script lang="ts">
	import { initStores } from './stores/stores.js';
	import { onMount } from 'svelte';
    import * as animateScroll from "svelte-scrollto";
    import NavBar from "./components/NavBar.svelte";
	import Chart from "./components/Chart.svelte";
	import Preview from "./components/Preview.svelte";
    
	onMount(() => {
		initStores();
	});
</script>

<main>

	<NavBar/>

	<Chart />

	<Preview />
	
</main>
