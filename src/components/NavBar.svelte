<script lang="ts">
    import { _, locale, locales } from 'svelte-i18n';
	import { appConfig } from '../stores/appConfig';
	import { templates } from '../stores/patternTemplates';
	
    const handleLocaleChange = (selectedLocale: string) => {
	    locale.set(selectedLocale);
    };
</script>

<nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
            <li>
                <a href={'#'}>{$_('navbar.templates')}</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                    	{#each $templates as template, index (index)}
	                        <li><a href="?{(new Date()).getTime()}#{template.hash}">{template.name}</a></li>
                    	{/each}
                    </ul>
                </div>
            </li>
        </ul>
    </div>
    <div class="uk-navbar-center">
        {$_('navbar.title')}
	</div>
    <div class="uk-navbar-right">
        <ul class="uk-navbar-nav">
            <li>
                <a href={'#'}>{$_('navbar.display')}</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                    	<li class="uk-nav-header">{$_('navbar.preview.weave')}</li>
                        <li>
                        	{$_('navbar.preview.size')}:
                        	<input class="uk-range" type="range" min="1" max="3" step="1" bind:value={$appConfig.weaveSize} />
                    	</li>
                    	<li>
                    		{$_('navbar.preview.outline')}:
                    		<input class="uk-input" type="color" bind:value={$appConfig.weaveBorderColor}/>
                    	</li>
                    	<li>
                			{$_('navbar.preview.weft')}:
		    				<input class="uk-input" type="color" bind:value={$appConfig.weftColor} />
                    	</li>
                    </ul>
                </div>
            </li>
            <li>
				{#each $locales as l}
	        		{#if $locale != l}
		            	<button type="button" class="uk-button uk-button-link" uk-icon="icon: world" data-testid="switch-locale-{l}" on:click={() => handleLocaleChange(l)}>
							{$_('lang', { locale: l })}
						</button>
	        		{/if}
				{/each}
            </li>
            <li>
            	<a href="https://www.youtube.com/watch?v=zJmZp41ZnEk" target="blank">
            		<span class="uk-icon" uk-icon="icon: youtube"></span>
            	</a>
            </li>
            <li>
            	<a href="https://github.com/resah/tablet-weaving" target="blank">
            		<span class="uk-icon uk-margin-small-right" uk-icon="icon: github"></span>
            	</a>
            </li>
            <li class="uk-text-right uk-text-meta">
            	{$_('navbar.build')} __BUILD_NUMBER__
            	<div class="uk-navbar-subtitle">__BUILD_DATE__</div>
            </li>
        </ul>
    </div>
</nav>

<style>
	.uk-navbar-nav > li > a,
	.uk-navbar-nav > li > button {
		min-height: 50px;
		color: #666;
		text-transform: uppercase;
	}
	input {
		border: 0;
	}
	
	@media print {
		.uk-navbar-container {
			display: none;
		}
	}
</style>
