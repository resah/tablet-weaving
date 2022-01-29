import { derived } from 'svelte/store';
import { weaveRows, tablets, rotationDirections } from './stores.js';
import type { Tablet } from '../model/tablet.type';
import type { Instruction } from '../model/instruction.type';
import type { Weave } from '../model/weave.type';

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
		return {
			color: weaveColor,
			sDirection: tabletDirection
		};
	});
}
