import { render } from '@testing-library/svelte';
import { appStorage, Storage } from '../stores/Storage';
import PatternSelectionSlide from './PatternSelectionSlide.svelte';

describe('PatternSelectionSlide component', () => {

  beforeEach(() => {
	window.location.hash = '';
	appStorage.update(_ => new Storage());
  });

  test('should render component correctly', () => {
    const svelteInfo = render(PatternSelectionSlide, {
		index: 4,
		template: {
			"name": "Oseberg",
			"tablets": 10,
			"century": "9",
			"region": "Norwegen",
			"technique": "Einzugsmuster",
			"hash": "someRandomHash"
		}
	});

	expect(svelteInfo.getByTestId('pattern-selection-slide-4')).toBeVisible();
  });
});
