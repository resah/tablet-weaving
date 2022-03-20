import { get } from 'svelte/store';
import { appStorage, Storage } from '../stores/Storage';

describe('Storage', () => {

  test('should not load invalid location hash and fallback to local storage', () => {
	window.location.hash = '#YXM3Njg3YXNkOnNkZnNk';
	window.localStorage.setItem('tabletWeaving', 'MzoxMDowMDAwMTAwMDAxMDAwMDAwMTAxMDAwMTAwMDAwMDA6fDEjMzQ2NWE0IzM0NjVhNCMzNDY1YTQjMzQ2NWE0fDAjY2MwMDAwI2NjMDAwMCNjYzAwMDAjY2MwMDAwfDAjZmNlOTRmI2ZjZTk0ZiNmY2U5NGYjZmNlOTRm');
	appStorage.update(_ => new Storage());

	expect(get(appStorage).tablets.length).toBe(3);
  });

  test('should not load invalid local storage and stay empty', () => {
	window.location.hash = '#abc';
	window.localStorage.setItem('tabletWeaving', 'YXM3Njg3YXNkOnNkZnNk');
	appStorage.update(_ => new Storage());

	expect(get(appStorage).tablets.length).toBe(0);
  });
});
