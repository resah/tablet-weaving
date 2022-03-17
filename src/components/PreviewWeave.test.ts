import { render } from '@testing-library/svelte';
import { Weave } from '../model/Weave';
import PreviewWeave from './PreviewWeave.svelte';

describe('PreviewWeave component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(PreviewWeave, {
	  props: {
	    weavePattern: [
			[
				new Weave('#445566', true),
				new Weave('#778899', false),
			]
		]
	  }
	});

	expect(container.querySelector('[data-testid="preview-weave"]')).toBeVisible();
	expect(container.querySelectorAll('.tabletWeaveIndices').length).toBe(1);
	expect(container.querySelectorAll('.tabletWeaveIndex').length).toBe(10);
	expect(container.querySelectorAll('.tablet').length).toBe(1);
  });
});
