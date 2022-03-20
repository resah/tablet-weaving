import { fireEvent, render } from '@testing-library/svelte';
import { appStorage, Storage } from '../stores/Storage';
import PatternSelectionModal from './PatternSelectionModal.svelte';

describe('PatternSelectionModal component', () => {

  beforeEach(() => {
	window.location.hash = global.__HASH__;
	appStorage.update(_ => new Storage());
  });

  test('should render component correctly', () => {
    const svelteInfo = render(PatternSelectionModal);

	expect(svelteInfo.getByTestId('pattern-selection-modal')).toBeVisible();
  });

  test('should select locale', async () => {
    const svelteInfo = render(PatternSelectionModal);

	const button = svelteInfo.queryByTestId('switch-locale-bonkers');
	await fireEvent.click(button);

	expect(svelteInfo.queryByTestId('switch-locale-mock')).toBeVisible();
  });
});
