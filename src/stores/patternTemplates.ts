import { derived, readable } from 'svelte/store';
import patternTemplates from '../templates/templates.json';

export const templates = readable(patternTemplates);

export const techniques = derived(templates, ($templates) => {
	return [...new Set($templates.map(t => t.technique))];
});

export const regions = derived(templates, ($templates) => {
	return [...new Set($templates.map(t => t.region))];
});
