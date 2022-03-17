import { fireEvent, render } from '@testing-library/svelte';
import { Tablet } from '../model/Tablet';
import { Thread } from '../model/Thread';
import ChartTablet from './ChartTablet.svelte';

describe('ChartTablet component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(ChartTablet, {
		index: 1,
		tablet: new Tablet(true, 4, [new Thread('#55FF99')])
	});

	expect(container.querySelector('.tablet')).toBeVisible();
  });

  test('should toggle tablet rotation direction', async () => {
	const tablet = new Tablet(true, 4, [new Thread('#55FF99')]);
    const svelteInfo = render(ChartTablet, {
		index: 1,
		tablet: tablet
	});

	const button = svelteInfo.queryByTestId('toggle-direction');
	await fireEvent.click(button);

	expect(tablet.sDirection).toBe(false);
  });
});
