import { readable } from 'svelte/store';
import patternTemplates from '../templates/templates.json';

export const templates = readable(patternTemplates);
