import { readable, writable } from 'svelte/store';

export const addMessages = () => {};

export const getLocaleFromQueryString = (_) => {};

export const init = (_) => {};

export const _ = readable((key: string, _: any = {}) => key);

export const locale = writable('mock');
export const locales = readable(['mock', 'bonkers']);
