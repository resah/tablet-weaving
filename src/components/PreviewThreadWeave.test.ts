import { render } from '@testing-library/svelte';
import { Weave } from '../model/Weave';
import PreviewThreadWeave from './PreviewThreadWeave.svelte';

describe('PreviewThreadWeave component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(PreviewThreadWeave, {
	  props: {
	    tabletIndex: 3,
		weaveRow: 12,
		weave: new Weave('#44bb22', true),
	  }
	});

	expect(container.querySelector('.weave').classList).toContain('weave');
	expect(container.querySelector('.weave').getAttribute('href')).toEqual('#baseWeave');
	expect(container.querySelector('.weave').getAttribute('fill')).toEqual('#44bb22');
  });
});
