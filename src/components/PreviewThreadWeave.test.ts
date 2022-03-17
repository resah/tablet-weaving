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
		classNames: 'bonkers'
	  }
	});

	expect(container.querySelector('.weave').classList).toContain('weave');
	expect(container.querySelector('.weave').classList).toContain('weaveSize3');
	expect(container.querySelector('.weave').classList).toContain('bonkers');
	expect(container.querySelector('.weave').classList).toContain('sDirection');
	expect(container.querySelector('.weave').outerHTML).toContain('uk-tooltip=\"4, 13\"');
	expect(container.querySelector('.weave').outerHTML).toContain('style=\"--backgroundColor: #44bb22; --borderColor: #AAAAAA;\"');
  });
});
