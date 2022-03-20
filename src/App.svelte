<script lang="ts">
    import {
		addMessages,
    	getLocaleFromQueryString,
	    init
    } from 'svelte-i18n';
    
	import en from './langs/en.json';
	import de from './langs/de.json';

	import { appStorage } from './stores/Storage';
    import NavBar from './components/NavBar.svelte';
	import Chart from './components/Chart.svelte';
	import Preview from './components/Preview.svelte';
	import PatternSelectionModal from './components/PatternSelectionModal.svelte';

	addMessages('en', en);
	addMessages('de', de);

    init({
        fallbackLocale: 'de',
    	initialLocale: getLocaleFromQueryString('lang')
    });
    
</script>

<main>

	<NavBar/>

	{#if $appStorage.tablets.length > 0}
		<Chart />
		<Preview />
	{/if}
	
	<PatternSelectionModal />
		
</main>
