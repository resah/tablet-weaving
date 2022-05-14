import { derived } from 'svelte/store';
import { appStorage } from './Storage';
import type { Tablet } from '../model/Tablet';
import type { Instruction } from '../model/instruction.type';
import { Weave } from '../model/Weave';

const COLOR_INDEX_FRONT_WEAVE = 0;
const COLOR_INDEX_BACK_WEAVE = 1;

// Front pattern
export const weavesFront = derived([appStorage], ([$appStorage]) => {
	return $appStorage.tablets.map((tablet: Tablet, tabletIndex: number) => {
		return generateWeaves($appStorage.weaveRows, $appStorage.rotationDirections, tablet, tabletIndex, COLOR_INDEX_FRONT_WEAVE, tablet.sDirection);
	});
});

// Back pattern
export const weavesBack = derived([appStorage], ([$appStorage]) => {
	return $appStorage.tablets.map((tablet: Tablet, tabletIndex: number) => {
		return generateWeaves($appStorage.weaveRows, $appStorage.rotationDirections, tablet, tabletIndex, COLOR_INDEX_BACK_WEAVE, !tablet.sDirection);
	});
});

function generateWeaves(weaveRows: number, rotationDirections: Instruction, tablet: Tablet, tabletIndex: number, colorIndex: number, direction: boolean): Weave[] {
	const threads = tablet.threads;
	const numberOfHoles = threads.length;
	
	let previousRotation = false;
	
	return [...Array(weaveRows).keys()].map((i: number) => {
		let offset = 1;
		let tabletDirection = direction;
		
		const rotateBack = typeof rotationDirections[i] !== 'undefined' && rotationDirections[i][tabletIndex] === true;
		
		if (rotateBack) {
			tabletDirection = !direction;
			offset = -1;
		}
		if (previousRotation != rotateBack) {
			offset = 0; 
		}
		colorIndex = (colorIndex + offset + threads.length) % numberOfHoles;
		let weaveColor = threads[colorIndex].color;
		const weaveEmpty = threads[colorIndex].empty;
		
		// handle pebble weave
		if (weaveEmpty) {
			let newColorIndex = colorIndex;
			if (offset == -1 || rotateBack) {
				newColorIndex = (colorIndex - 1 + threads.length) % numberOfHoles;
			} else {
				newColorIndex = (colorIndex + 1 + threads.length) % numberOfHoles;				
			}
			weaveColor = threads[newColorIndex].color;
		}
		
		previousRotation = rotateBack;
		return new Weave(weaveColor, tabletDirection);
	});
}
