import { fireEvent, render } from '@testing-library/svelte';
import ChartSummary from './ChartSummary.svelte';

describe('ChartSummary component', () => {
	
  test('should render component correctly', () => {
    const svelteInfo = render(ChartSummary);

	expect(svelteInfo.queryByTestId('summary-open')).toBeVisible();
  });

  test('should open summary', async () => {
    const svelteInfo = render(ChartSummary);

	const button = svelteInfo.queryByTestId('summary-open');
	await fireEvent.click(button);
	
	expect(svelteInfo.queryByTestId('summary-close')).toBeVisible();
  });

  test('should update color', async () => {
    const svelteInfo = render(ChartSummary);

	// open summary
	const button = svelteInfo.queryByTestId('summary-open');
	await fireEvent.click(button);
	expect(svelteInfo.queryByTestId('summary-close')).toBeVisible();
	
	// change color
	const colorInput = svelteInfo.queryByTestId('chart-summary-update-color-#cc0000');
	await fireEvent.change(colorInput, {target: {value: '#FF00FF'}});
	
	expect(svelteInfo.queryByTestId('chart-summary-update-color-#ff00ff')).toBeVisible();
  });
});
