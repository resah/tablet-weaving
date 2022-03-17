import { get } from 'svelte/store';
import { appStorage } from './Storage';
import { weavesFront } from './weaves';

describe('Weaves store', () => {

  test('should be initialized', () => {
	appStorage.update(a => {
	  a.weaveRows = 5;
	  a.rotationDirections = {
		1: {
			1: true,
			2: false
		}
	  }
	  return a;
	});
	
	const updatedStore = get(weavesFront);
    expect(updatedStore.length).toEqual(2);
  });
});
