<script lang="ts">
	import { onMount } from 'svelte';
    import {
		addMessages,
    	getLocaleFromQueryString,
	    init
    } from 'svelte-i18n';
    
	import en from './langs/en.json';
	import de from './langs/de.json';

	import { initStores } from './stores/stores.js';
    import NavBar from './components/NavBar.svelte';
	import Chart from './components/Chart.svelte';
	import Preview from './components/Preview.svelte';
    
	onMount(() => {
		initStores();
	});

	addMessages('en', en);
	addMessages('de', de);

    init({
        fallbackLocale: 'de',
    	initialLocale: getLocaleFromQueryString('lang')
    });
    
</script>

<main>

	<NavBar/>

	<Chart />

	<Preview />
	
</main>
