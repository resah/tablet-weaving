import { fireEvent, render } from '@testing-library/svelte';
import NavBar from './NavBar.svelte';

describe('NavBar component', () => {

  test('should render component correctly', () => {
    const { container } = render(NavBar);

	expect(container.querySelector('nav').classList).toContain('uk-navbar-container');
  });

  test('should select locale', async () => {
    const svelteInfo = render(NavBar);

	const button = svelteInfo.queryByTestId('switch-locale-bonkers');
	await fireEvent.click(button);

	expect(svelteInfo.queryByTestId('switch-locale-mock')).toBeVisible();
  });
});
