<script lang="ts">
    import { _, locale, locales } from 'svelte-i18n';
	import { appConfig } from '../stores/appConfig';
	
    const handleLocaleChange = (selectedLocale: string) => {
	    locale.set(selectedLocale);
    };
</script>

<nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
            <li>
                <button type="button" class="uk-button uk-button-link uk-navbar-item" uk-toggle="target: #pattern-selection">{$_('navbar.templates')}</button>
            </li>
        </ul>
    </div>
    <div class="uk-navbar-center" data-testid="nav-bar">
        {$_('navbar.title')}
	</div>
    <div class="uk-navbar-right">
        <ul class="uk-navbar-nav">
            <li>
                <a href={'#'}>{$_('navbar.features.title')}</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                        <li>
                        	{$_('navbar.features.pebbleWeave')}: <input class="uk-checkbox" type="checkbox" bind:checked={$appConfig.enablePebbleWeave} />
                    	</li>
                    </ul>
                </div>
            </li>
            <li>
                <a href={'#'}>{$_('navbar.preview.title')}</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                        <li>
                        	{$_('navbar.preview.size')}:
                        	<input class="uk-range" type="range" min="1" max="5" step="1" bind:value={$appConfig.weaveSize} />
                    	</li>
                    	<li>
                    		{$_('navbar.preview.outline')}:
                    		<input class="uk-checkbox" type="checkbox" bind:checked={$appConfig.showWeaveBorder}/>
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
            	<a href="https://www.youtube.com/watch?v=zJmZp41ZnEk" target="blank" aria-label={$_('navbar.links.youtube')}>
            		<span class="uk-icon" uk-icon="icon: youtube"></span>
            	</a>
            </li>
            <li>
            	<a href="https://github.com/resah/tablet-weaving" target="blank" aria-label={$_('navbar.links.github')}>
            		<span class="uk-icon uk-margin-small-right" uk-icon="icon: github"></span>
            	</a>
            </li>
            <li class="uk-text-right uk-text-meta">
            	{$_('navbar.info.version')}
            	<div class="uk-navbar-subtitle">__VERSION_NUMBER__</div>
            	<div uk-dropdown>
				    <ul class="uk-nav uk-dropdown-nav">
				    	<li class="uk-nav-header">{$_('navbar.info.buildNumber')}</li>
				        <li>__BUILD_NUMBER__</li>
				        <li class="uk-nav-header">{$_('navbar.info.buildDate')}</li>
				        <li>__BUILD_DATE__</li>
				    </ul>
				</div>
            </li>
        </ul>
    </div>
</nav>

<style>
	.uk-navbar-dropdown {
		width: 250px;
	}
	.uk-navbar-dropdown li {
		padding: 0 0 15px;
	}
	.uk-navbar-nav > li > a,
	.uk-navbar-nav > li > button {
		min-height: 50px;
		color: #666;
		text-transform: uppercase;
	}
	input[type="color"],
	input[type="range"] {
		border: 0;
	}
	.uk-text-meta {
		color: #333;
	}
	
	@media print {
		.uk-navbar-container {
			display: none;
		}
	}
</style>
