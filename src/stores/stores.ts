import { writable, derived } from 'svelte/store';
import type { Tablet } from '../model/tablet.type';
import type { Thread } from '../model/thread.type';
import type { Instruction } from '../model/instruction.type';
import { appConfig } from './appConfig.js';


///////////////////////////////////////////////////////////
// Writable stores
///////////////////////////////////////////////////////////

const initTablets: Tablet[] = [
	{ sDirection: true, holes: 4, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }, 
	{ sDirection: true, holes: 4, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, holes: 4, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, holes: 4, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }
];

const storedWeaveRows: number = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
const storedTablets: Tablet[] = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
const storedRotationDirections: Instruction = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : {};

const initialized = writable<boolean>(false);
export const weaveRows = writable<number>(storedWeaveRows);
export const tablets = writable<Tablet[]>(storedTablets);
export const rotationDirections = writable<Instruction>(storedRotationDirections);

weaveRows.subscribe((value: number) => localStorage.weaveRows = value);
tablets.subscribe((value: Tablet[]) => localStorage.tablets = JSON.stringify(value));
rotationDirections.subscribe((value: Instruction) => localStorage.rotationDirections = JSON.stringify(value));

export function initStores(): void {
	const parts = atob(window.location.hash.substring(1)).split(':');
	if (parts.length !== 4) {
		initialized.set(true);
		return;
	}
	
	const numberOfTablets = parseInt(parts[0]);
	const numberOfWeaves = parseInt(parts[1]);
	const initRotationDirections: Instruction = {};
	[...Array(numberOfWeaves).keys()].forEach((row: number) => {
		[...Array(numberOfTablets).keys()].forEach((col: number) => {
			if (typeof initRotationDirections[row] === 'undefined') {
				initRotationDirections[row] = {};
			}
			
			initRotationDirections[row][col] = parts[2][(row * numberOfTablets + col)] === '1';
		});
	});
	const initTablets: Tablet[] = parts[3].substring(1).split('|').map(tablet => {
		return { 
			sDirection: tablet[0] === '1', 
			holes: 4, 
			threads: tablet.substring(2).split('#').map(colorCode => {
				return { color: `#${colorCode}` };
			})
		};
	});
	
	weaveRows.set(numberOfWeaves);
	rotationDirections.set(initRotationDirections);
	tablets.set(initTablets);
	initialized.set(true);
}

///////////////////////////////////////////////////////////
// Derived stores
///////////////////////////////////////////////////////////

// Update URL hash with every update
export const urlHash = derived([initialized, weaveRows, tablets, rotationDirections], ([$initialized, $weaveRows, $tablets, $rotationDirections]) => {
	if (!$initialized) {
		return null;
	}
	const rotDirValue = [...Array($weaveRows).keys()].reduce((previousValue, _, index) => {
		return [...Array($tablets.length).keys()].reduce((prev, _, idx) => {
			const rotateBack = typeof $rotationDirections[index] !== 'undefined' && $rotationDirections[index][idx] === true;
			return `${prev}${(rotateBack ? '1' : '0')}`; 
		}, previousValue);
	}, '');
	const colors = $tablets.reduce((previousValue: string, currentValue: Tablet) => {
		return `${previousValue}|${(currentValue.sDirection ? '1' : '0')}` + currentValue.threads.reduce((prev: string, curr: Thread) => `${prev}${curr.color}`, '');
	}, '');
	return `${$tablets.length}:${$weaveRows}:${rotDirValue}:${colors}`;
}).subscribe((value: string) => {
	if (value) {
		window.location.hash = "#" + btoa(value);
	}
});

// Colors
const patternColors = derived(tablets, ($tablets) => {
	const summary: {[key: string]: number} = {};
	$tablets.forEach((tablet) => {
		tablet.threads.forEach((thread) => {
			if (typeof summary[thread.color] == 'undefined') {
				summary[thread.color] = 1;
			} else {
				summary[thread.color] = summary[thread.color] + 1;
			}
		});
	});
	return Object.entries(summary).map(([key, value]) => { 
		return { "color": key, "count": value };
	});
});

export const weaveLength = derived([appConfig, patternColors], ([$appConfig, $patternColors]) => {
	return $patternColors.map((colorCount) => {
		const baseLength = colorCount.count * $appConfig.weaveLength;
		return {
			color: colorCount.color,
			count: colorCount.count,
			baseLength: baseLength,
			fullLength: baseLength + baseLength * 0.2 + 50
		};
	});
});

