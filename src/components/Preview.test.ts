import { fireEvent, render } from '@testing-library/svelte';
import { appStorage, Storage } from '../stores/Storage';
import Preview from './Preview.svelte';

describe('Preview component', () => {

  beforeEach(() => {
	window.location.hash = global.__HASH__;
	appStorage.update(_ => new Storage());
  });
	
  test('should render component correctly', () => {
    const { container } = render(Preview);
	
	expect(container.querySelector('[data-test-instructions]')).toBeVisible();
	expect(container.querySelector('[data-test-front-weave]')).toBeVisible();
	expect(container.querySelector('[data-test-back-weave]')).toBeVisible();
  });

  test('should add a weave row', async () => {
    const svelteInfo = render(Preview);

	// because of front + back
	// (tablets * length ) * 2  
	expect(svelteInfo.queryAllByTestId('preview-thread-weave').length).toBe((2 * 10) * 2);
	
	const button = svelteInfo.queryByTestId('add-weave-row');
	await fireEvent.click(button);

	expect(svelteInfo.queryAllByTestId('preview-thread-weave').length).toBe((2 * 11) * 2);
  });

  test('should remove a weave row', async () => {
    const svelteInfo = render(Preview);

	expect(svelteInfo.queryAllByTestId('preview-thread-weave').length).toBe((2 * 10) * 2);

	const button = svelteInfo.queryByTestId('remove-weave-row');
	await fireEvent.click(button);

	expect(svelteInfo.queryAllByTestId('preview-thread-weave').length).toBe((2 * 9) * 2);
  });

  test('should hide/show instructions', async () => {
    const svelteInfo = render(Preview);

	expect(svelteInfo.queryByTestId('preview-instructions-hide')).toBeVisible();

	const hideButton = svelteInfo.queryByTestId('preview-instructions-hide');
	await fireEvent.click(hideButton);

	expect(svelteInfo.queryByTestId('preview-instructions')).not.toBeVisible();
	expect(svelteInfo.queryByTestId('preview-instructions-show')).toBeVisible();
	
	const showButton = svelteInfo.queryByTestId('preview-instructions-show');
	await fireEvent.click(showButton);
	
	expect(svelteInfo.queryByTestId('preview-instructions')).toBeVisible();
	expect(svelteInfo.queryByTestId('preview-instructions-hide')).toBeVisible();
  });

  test('should hide/show weave back', async () => {
    const svelteInfo = render(Preview);

	expect(svelteInfo.queryByTestId('preview-back-hide')).toBeVisible();

	const hideButton = svelteInfo.queryByTestId('preview-back-hide');
	await fireEvent.click(hideButton);

	expect(svelteInfo.queryByTestId('preview-back')).not.toBeVisible();
	expect(svelteInfo.queryByTestId('preview-back-show')).toBeVisible();
	
	const showButton = svelteInfo.queryByTestId('preview-back-show');
	await fireEvent.click(showButton);
	
	expect(svelteInfo.queryByTestId('preview-back')).toBeVisible();
	expect(svelteInfo.queryByTestId('preview-back-hide')).toBeVisible();
  });
});
