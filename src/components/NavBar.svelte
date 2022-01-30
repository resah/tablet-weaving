<script lang="ts">
	import { appConfig } from '../stores/appConfig.js';
	import { templates } from '../stores/patternTemplates.js';
</script>

<nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
            <li>
                <a href={'#'}>Vorlagen</a>
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
        Brettchenweben
	</div>
    <div class="uk-navbar-right">
        <ul class="uk-navbar-nav">
            <li>
                <a href={'#'}>Anzeige</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                    	<li class="uk-nav-header">Vorschau Gewebe</li>
                        <li>
                        	Größe:
                        	<input class="uk-range" type="range" min="1" max="3" step="1" bind:value={$appConfig.weaveSize} />
                    	</li>
                    	<li>
                    		Fadenumrisse:
                    		<input class="uk-input" type="color" bind:value={$appConfig.weaveBorderColor}/>
                    	</li>
                    	<li>
                			Schussfaden:
		    				<input class="uk-input" type="color" bind:value={$appConfig.weftColor} />
                    	</li>
                    </ul>
                </div>
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
        </ul>
    </div>
</nav>

<style>
	.uk-navbar-nav > li > a {
		min-height: 50px;
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
