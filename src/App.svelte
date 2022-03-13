<script lang="ts">
    import {
		addMessages,
    	getLocaleFromQueryString,
	    init
    } from 'svelte-i18n';
    
	import en from './langs/en.json';
	import de from './langs/de.json';

    import NavBar from './components/NavBar.svelte';
	import Chart from './components/Chart.svelte';
	import Preview from './components/Preview.svelte';

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
