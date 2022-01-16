import { writable, derived } from 'svelte/store';


///////////////////////////////////////////////////////////
// Writable stores
///////////////////////////////////////////////////////////

const initTablets = [
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }, 
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, {color: "#ffffff" }] },
	{ sDirection: true, threads: [{color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, {color: "#204a87" }] }
];

const storedWeaveRows = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
const storedTablets = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
const storedRotationDirections = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : {};

const initialized = writable(false);
export const weaveRows = writable(storedWeaveRows);
export const tablets = writable(storedTablets);
export const rotationDirections = writable(storedRotationDirections);

weaveRows.subscribe((value) => localStorage.weaveRows = value);
tablets.subscribe((value) => localStorage.tablets = JSON.stringify(value));
rotationDirections.subscribe((value) => localStorage.rotationDirections = JSON.stringify(value));

export function initStores() {
	const parts = atob(window.location.hash.substring(1)).split(':');
	if (parts.length !== 4) {
		initialized.set(true);
		return;
	}
	
	const numberOfTablets = parseInt(parts[0]);
	const numberOfWeaves = parseInt(parts[1]);
	const initRotationDirections = {};
	[...Array(numberOfWeaves).keys()].forEach(row => {
		[...Array(numberOfTablets).keys()].forEach(col => {
			if (typeof initRotationDirections[row] === 'undefined') {
				initRotationDirections[row] = {};
			}
			
			initRotationDirections[row][col] = parts[2][(row * numberOfTablets + col)] === '1';
		});
	});
	const initTablets = parts[3].substring(1).split('|').map(tablet => {
		return { 
			sDirection: tablet[0] === '1', 
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
		return [...Array($tablets.length).keys()].reduce((prev, curr, idx) => {
			const rotateBack = typeof $rotationDirections[index] !== 'undefined' && typeof $rotationDirections[index][idx] !== 'undefined' && $rotationDirections[index][idx] === true;
			return `${prev}${(rotateBack ? '1' : '0')}`; 
		}, previousValue);
	}, '');
	const colors = $tablets.reduce((previousValue, currentValue) => {
		return `${previousValue}|${(currentValue.sDirection ? '1' : '0')}` + currentValue.threads.reduce((prev, curr) => `${prev}${curr.color}`, '');
	}, '');
	return `${$tablets.length}:${$weaveRows}:${rotDirValue}:${colors}`;
}).subscribe(value => {
	if (value) {
		window.location.hash = "#" + btoa(value);
	}
});

// Front pattern
export const weavesFront = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
	return $tablets.map((tablet, tabletIndex) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 0, tablet.sDirection));
});

// Back pattern
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
			
			const rotateBack = typeof rotationDirections[i] !== 'undefined' && typeof rotationDirections[i][tabletIndex] !== 'undefined' && rotationDirections[i][tabletIndex] === true;
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
