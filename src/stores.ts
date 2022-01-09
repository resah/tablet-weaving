import { readable, writable, derived } from 'svelte/store';

const initTablets = [
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }, 
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }
];

const storedWeaveRows = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
const storedTablets = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
const storedRotationDirections = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : [];

export const weaveRows = writable(storedWeaveRows);
export const tablets = writable(storedTablets);
export const rotationDirections = writable(storedRotationDirections);

weaveRows.subscribe((value) => localStorage.weaveRows = value);
tablets.subscribe((value) => localStorage.tablets = JSON.stringify(value));
rotationDirections.subscribe((value) => localStorage.rotationDirections = JSON.stringify(value));

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
	
	return $tablets.map(tablet => {
		const threads = tablet.threads;
		const numberOfHoles = threads.length;
		let tabletDirection = tablet.sDirection;
		let index = -1;

		return {
			weaves: [...Array($weaveRows).keys()].map(i => {
				if ($rotationDirections.includes(i)) {
					tabletDirection = !tabletDirection;
				}
				index = index + (tabletDirection ? -1 : 1);
				const weaveColor = threads[Math.abs(index) % numberOfHoles].color;
				return {
					color: weaveColor,
					sDirection: tabletDirection
				};
			})
		};
	});
});
