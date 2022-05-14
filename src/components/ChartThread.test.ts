import { render } from '@testing-library/svelte';
import { appConfig } from '../stores/appConfig';
import { Thread } from '../model/Thread';
import ChartThread from './ChartThread.svelte';

describe('ChartThread component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(ChartThread, {
	  thread: new Thread('#227755')
	});

	expect(container.querySelector('.thread')).toBeVisible();
  });

  test('should render component correctly with enabled pebble weave', () => {
	appConfig.update((ac) => {
		ac.enablePebbleWeave = true;
		return ac;
	});
    const { container } = render(ChartThread, {
	  thread: new Thread('#227755', true)
	});

	expect(container.querySelector('.uk-button')).toBeVisible();
	expect(container.querySelector('.uk-button').innerHTML).toContain('○');
  });
});
