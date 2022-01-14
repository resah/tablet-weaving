import { readable, writable, derived } from 'svelte/store';

const initTablets = [
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }, 
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }
];

const storedWeaveRows = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
const storedTablets = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
const storedRotationDirections = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : {};

export const weaveRows = writable(storedWeaveRows);
export const tablets = writable(storedTablets);
export const rotationDirections = writable(storedRotationDirections);
export const switchInstructions = writable([]);

weaveRows.subscribe((value) => localStorage.weaveRows = value);
tablets.subscribe((value) => localStorage.tablets = JSON.stringify(value));
rotationDirections.subscribe((value) => localStorage.rotationDirections = JSON.stringify(value));

// derived stores

export const instructions = derived([weaveRows, rotationDirections], ([$weaveRows, $rotationDirections]) => {
	let rotationDirection = true;
	return [...Array($weaveRows).keys()].map(i => {
		if ($rotationDirections.includes(i)) {
			rotationDirection = !rotationDirection;
		}
		return rotationDirection;
	});
});

export const weaves = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	return $tablets.map((tablet, tabletIndex) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 0, tablet.sDirection));
});

export const weavesBack = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	return $tablets.map((tablet, tabletIndex) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 2, !tablet.sDirection));
});

function generateWeaves(weaveRows, rotationDirections, tablet, tabletIndex, colorIndex, direction) {
	const threads = tablet.threads;
	const numberOfHoles = threads.length;
	
	let previousRotation = false;

	return {
		weaves: [...Array(weaveRows).keys()].map(i => {
			let offset = 1;
			let tabletDirection = direction;
			
			const rotateBack = typeof rotationDirections[i] !== 'undefined' && typeof rotationDirections[i][tabletIndex] !== 'undefined';
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
		})
	};
}
