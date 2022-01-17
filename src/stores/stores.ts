import { writable, derived } from 'svelte/store';
import type { Tablet } from '../model/tablet.type';
import type { Thread } from '../model/thread.type';
import type { Instruction } from '../model/instruction.type';
import type { Weave } from '../model/weave.type';


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
			const rotateBack = isRotateBack($rotationDirections[index], idx);
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

// Front pattern
export const weavesFront = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	return $tablets.map((tablet: Tablet, tabletIndex: number) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 0, tablet.sDirection));
});

// Back pattern
export const weavesBack = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	return $tablets.map((tablet: Tablet, tabletIndex: number) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 2, !tablet.sDirection));
});

function generateWeaves(weaveRows: number, rotationDirections: Instruction, tablet: Tablet, tabletIndex: number, colorIndex: number, direction: boolean): Weave[] {
	const threads = tablet.threads;
	const numberOfHoles = threads.length;
	
	let previousRotation = false;

	return [...Array(weaveRows).keys()].map((i: number) => {
		let offset = 1;
		let tabletDirection = direction;
		
		const rotateBack = isRotateBack(rotationDirections[i], tabletIndex);
		if (rotateBack) {
			tabletDirection = !direction;
			offset = -1;
		}
		if (previousRotation != rotateBack) {
			offset = 0; 
		}
		colorIndex = (colorIndex + offset + threads.length) % numberOfHoles;
		const weaveColor = threads[colorIndex].color;
		previousRotation = rotateBack;
		return {
			color: weaveColor,
			sDirection: tabletDirection
		};
	});
}

function isRotateBack(object: any, idx: number): boolean {
	return typeof object !== 'undefined' && typeof object[idx] !== 'undefined' && object[idx] === true;
}
