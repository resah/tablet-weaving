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


export const weaves = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	
	return $tablets.map(tablet => {
		const numberOfHoles = tablet.threads.length;
		let tabletDirection = tablet.sDirection;

		return {
			weaves: [...Array($weaveRows).keys()].map(i => {
				if ($rotationDirections.includes(i)) {
					tabletDirection = !tabletDirection;
				}
				return {
					color: tablet.threads[i % numberOfHoles].color,
					sDirection: tabletDirection
				};
			})
		};
	});
});
