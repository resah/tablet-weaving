import { render } from '@testing-library/svelte';
import App from './App.svelte';

describe('App component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(App);
	
	expect(container.querySelector('.threadingChart')).toBeVisible();
  });
});
