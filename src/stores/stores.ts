import { derived } from 'svelte/store';
import { ColorIndex } from '../model/ColorIndex';
import { WeaveLength } from '../model/WeaveLength';
import { YarnLength } from '../model/YarnLength';
import { appConfig } from './appConfig';
import { appStorage, Storage } from './Storage';

// Color index for summary
const patternColors = derived(appStorage, ($appStorage: Storage): ColorIndex[] => {
	const summary: {[key: string]: number} = {};
	$appStorage.tablets.forEach((tablet) => {
		tablet.threads.forEach((thread) => {
			if (thread.empty) {
				return;
			} else if (typeof summary[thread.color] == 'undefined') {
				summary[thread.color] = 1;
			} else {
				summary[thread.color] = summary[thread.color] + 1;
			}
		});
	});
	return Object.entries(summary).map(([key, value]) => new ColorIndex(key, value));
});

// Calculation of length of each thread and total length of yarn for each color
export const weaveLength = derived([appConfig, patternColors], ([$appConfig, $patternColors]) => {
	const singleYarnLength: number = Number($appConfig.weaveLength) + Number($appConfig.weaveLength * 0.2) + 50;
	const yarnLengths = $patternColors.map((colorCount) => {
		const yarnLength: number = colorCount.count * singleYarnLength;
		return new YarnLength(colorCount.color, colorCount.count, yarnLength);
	});
	return new WeaveLength(singleYarnLength, yarnLengths);
});
