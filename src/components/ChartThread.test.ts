import { render } from '@testing-library/svelte';
import { Thread } from '../model/Thread';
import ChartThread from './ChartThread.svelte';

describe('ChartThread component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(ChartThread, {
	  thread: new Thread('#227755')
	});

	expect(container.querySelector('.thread')).toBeVisible();
  });
});
