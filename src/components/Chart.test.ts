import { fireEvent, render } from '@testing-library/svelte';
import { appStorage, Storage } from '../stores/Storage';
import Chart from './Chart.svelte';

describe('Chart component', () => {

  beforeEach(() => {
	window.location.hash = global.__HASH__;
	appStorage.update(_ => new Storage());
  });

  test('should render component correctly', () => {
    const { container } = render(Chart);

	expect(container.querySelector('[data-test-chart]')).toBeVisible();
  });

  test('should add a tablet to the chart', async () => {
    const svelteInfo = render(Chart);

	expect(svelteInfo.container.querySelectorAll('.tablet').length).toBe(2);
	
	const button = svelteInfo.queryByTestId('add-tablet');
	await fireEvent.click(button);

	expect(svelteInfo.container.querySelectorAll('.tablet').length).toBe(3);
  });

  test('should remove a tablet from the chart', async () => {
    const svelteInfo = render(Chart);

	expect(svelteInfo.container.querySelectorAll('.tablet').length).toBe(2);

	const button = svelteInfo.queryByTestId('remove-tablet');
	await fireEvent.click(button);

	expect(svelteInfo.container.querySelectorAll('.tablet').length).toBe(1);
  });
});
