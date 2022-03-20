import { render } from '@testing-library/svelte';
import { appStorage, Storage } from './stores/Storage';
import App from './App.svelte';

describe('App component', () => {
	
  test('should render component correctly', () => {
	
	window.location.hash = global.__HASH__;
	appStorage.update(_ => new Storage());
	
    const svelteInfo = render(App);
	
	expect(svelteInfo.container.querySelector('.uk-navbar-container')).toBeVisible();
  });
});
