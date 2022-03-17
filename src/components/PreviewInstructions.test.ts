import { fireEvent, render } from '@testing-library/svelte';
import { appStorage, Storage } from '../stores/Storage';
import PreviewInstructions from './PreviewInstructions.svelte';

describe('PreviewInstructions component', () => {

  beforeEach(() => {
	window.location.hash = global.__HASH__;
	appStorage.update(_ => new Storage());
  });
	
  test('should render component correctly', () => {
    const { container } = render(PreviewInstructions);
	
	expect(container.querySelectorAll('tr').length).toBe(11);
	expect(container.querySelectorAll('button').length).toBe(31);
  });

  test('should reset tablet rotations', async () => {
    const svelteInfo = render(PreviewInstructions);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(5);
	
	const button = svelteInfo.queryByTestId('reset-directions');
	await fireEvent.click(button);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(0);
  });

  test('should change tablet rotation directions for first row', async () => {
    const svelteInfo = render(PreviewInstructions);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(5);
	
	const button = svelteInfo.queryByTestId('toggle-directions-row-0');
	await fireEvent.click(button);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(7);
  });

  test('should change tablet rotation directions for already switched weave', async () => {
    const svelteInfo = render(PreviewInstructions);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(5);
	
	const button = svelteInfo.queryByTestId('toggle-directions-cell-1-1');
	await fireEvent.click(button);

	expect(svelteInfo.container.querySelectorAll('.active').length).toBe(4);
  });
});
