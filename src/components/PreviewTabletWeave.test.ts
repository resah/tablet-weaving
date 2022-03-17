import { render } from '@testing-library/svelte';
import { Weave } from '../model/Weave';
import PreviewTabletWeave from './PreviewTabletWeave.svelte';

describe('PreviewTabletWeave component', () => {
	
  test('should render component correctly', () => {
    const { container } = render(PreviewTabletWeave, {
	  props: {
		tabletIndex: 4,
        weaves: [
		  new Weave('#aabbcc', true),
		  new Weave('#778899', false)
		]
	  }
	});
	
	expect(container.querySelector('.tablet').classList).toContain('tablet');
	expect(container.querySelector('.tablet').classList).toContain('weaveSize3');
	expect(container.querySelector('.tablet').children.length).toBe(3);
  });
});
