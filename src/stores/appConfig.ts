import { writable } from 'svelte/store';
import type { AppConfig } from '../model/appConfig.type';

const initAppConfig: AppConfig = {
	weaveSize: 3,
	weaveBorderColor: '#AAAAAA'
};

const storedAppConfig: AppConfig = localStorage.appConfig ? JSON.parse(localStorage.appConfig) : initAppConfig;

export const appConfig = writable<AppConfig>(storedAppConfig);

appConfig.subscribe((value) => localStorage.appConfig = JSON.stringify(value));
