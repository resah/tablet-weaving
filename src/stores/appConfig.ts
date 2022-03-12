import { writable } from 'svelte/store';
import { AppConfig } from '../model/AppConfig';

const storedAppConfig: AppConfig = localStorage.appConfig ? JSON.parse(localStorage.appConfig) : new AppConfig();

export const appConfig = writable<AppConfig>(storedAppConfig);

appConfig.subscribe((value) => localStorage.appConfig = JSON.stringify(value));
