import { writable, derived } from 'svelte/store';
import type { Instruction } from '../model/instruction.type';
import { appConfig } from './appConfig.js';
import { ColorIndex } from '../model/ColorIndex';
import { Tablet } from '../model/Tablet';
import { Thread } from '../model/Thread';


///////////////////////////////////////////////////////////
// Writable stores
///////////////////////////////////////////////////////////

const initTablets: Tablet[] = [
	new Tablet(true, 4, [new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87")]), 
	new Tablet(true, 4, [new Thread("#ffffff"), new Thread("#d3d7cf"), new Thread("#ffffff"), new Thread("#ffffff")]),
	new Tablet(true, 4, [new Thread("#ffffff"), new Thread("#d3d7cf"), new Thread("#ffffff"), new Thread("#ffffff")]),
	new Tablet(true, 4, [new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87")])
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
	const parts = window.atob(window.location.hash.substring(1)).split(':');
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
		window.location.hash = "#" + window.btoa(value);
	}
});

// Colors index
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
	return Object.entries(summary).map(([key, value]) => new ColorIndex(key, value));
});

// Calculation of length of each thread and total length of yarn for each color
export const weaveLength = derived([appConfig, patternColors], ([$appConfig, $patternColors]) => {
	const singleYarnLength: number = Number($appConfig.weaveLength) + Number($appConfig.weaveLength * 0.2) + 50;
	const yarnLengths = $patternColors.map((colorCount) => {
		const yarnLength: number = colorCount.count * singleYarnLength;
		return {
			color: colorCount.color,
			count: colorCount.count,
			yarnLength: yarnLength
		};
	});
	return {
		singleYarnLength: singleYarnLength,
		yarnLengths: yarnLengths
	};
});

