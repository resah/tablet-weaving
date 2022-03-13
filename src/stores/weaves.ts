import { derived } from 'svelte/store';
import { appStorage } from './Storage';
import type { Tablet } from '../model/Tablet';
import type { Instruction } from '../model/instruction.type';
import { Weave } from '../model/Weave';

// Front pattern
export const weavesFront = derived([appStorage], ([$appStorage]) => {
	return $appStorage.tablets.map((tablet: Tablet, tabletIndex: number) => generateWeaves($appStorage.weaveRows, $appStorage.rotationDirections, tablet, tabletIndex, 0, tablet.sDirection));
});

// Back pattern
export const weavesBack = derived([appStorage], ([$appStorage]) => {
	return $appStorage.tablets.map((tablet: Tablet, tabletIndex: number) => generateWeaves($appStorage.weaveRows, $appStorage.rotationDirections, tablet, tabletIndex, 2, !tablet.sDirection));
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
		const weaveColor = threads[colorIndex].color;
		previousRotation = rotateBack;
		
		return new Weave(weaveColor, tabletDirection);
	});
}
