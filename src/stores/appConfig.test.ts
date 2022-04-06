import { get } from 'svelte/store';
import { AppConfig } from '../model/AppConfig';
import { appConfig } from './appConfig';

describe('appConfig store', () => {
	beforeEach(() => {
		appConfig.set(new AppConfig());
	});

	test('should be initialized with default values', () => {
	  const appConfigValue = get(appConfig);
		
	  expect(appConfigValue.weaveSize).toEqual(3);
	  expect(appConfigValue.weaveBorderColor).toEqual('#AAAAAA');
	  expect(appConfigValue.weftColor).toEqual('#000000');
	  expect(appConfigValue.weaveLength).toEqual(100);
	  expect(appConfigValue.showWeaveBorder).toEqual(true);
	});
	
	test('should update local storage if config is updated', () => {
	  const newAppConfig = new AppConfig();
	  newAppConfig.weaveSize = 2;
	  newAppConfig.weaveBorderColor = '#000000';
	  newAppConfig.weftColor = '#FFFFFF';
	  newAppConfig.weaveLength = 20;
	
	  appConfig.update(_ => newAppConfig);
	
	  const updatedAppConfig = JSON.parse(window.localStorage.appConfig);
	  expect(updatedAppConfig.weaveSize).toBe(2);
	  expect(updatedAppConfig.weaveBorderColor).toBe("#000000");
	  expect(updatedAppConfig.weftColor).toBe("#FFFFFF");
	  expect(updatedAppConfig.weaveLength).toBe(20);
	  expect(updatedAppConfig.showWeaveBorder).toEqual(true);
	});
});
