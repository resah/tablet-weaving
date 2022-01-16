import { writable } from 'svelte/store';

const initAppConfig = {
	weaveSize: 3,
	weaveBorderColor: '#AAAAAA'
};

const storedAppConfig = localStorage.appConfig ? JSON.parse(localStorage.appConfig) : initAppConfig;

export const appConfig = writable(storedAppConfig);

appConfig.subscribe((value) => localStorage.appConfig = JSON.stringify(value));
