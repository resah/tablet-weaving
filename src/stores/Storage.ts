import { writable } from 'svelte/store';
import type { Instruction } from '../model/instruction.type';
import { Tablet } from '../model/Tablet';
import { appConfig } from './appConfig';

const LOCAL_STORAGE_KEY = 'tabletWeaving';

export class Storage {
	
	weaveRows: number;
	tablets: Tablet[];
	rotationDirections: Instruction;
	locks: boolean[];
	
    constructor() {
		// has URL -> load from URL
		//console.log('Trying to load from URL ...');
		if (window.location.hash.length > 10) {
			if (this.fromString(window.location.hash.substring(1))) {
				return;
			}
		}
		
	    // has local storage -> load from local storage
		//console.log('Trying to load from local storage ...');
		const localStorageValue = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (localStorageValue !== undefined && localStorageValue !== null) {
			if (this.fromString(localStorageValue)) {
				return;
			}
		}

	    // create default values
		//console.log('No previous setup found');
		this.weaveRows = 0;
		this.tablets = [];
		this.rotationDirections = {};
		this.locks = [];
 	}
	
	toString(): string {
		const rotDirValue = [...Array(this.weaveRows).keys()].reduce((previousValue, _, index) => {
			return [...Array(this.tablets.length).keys()].reduce((prev, _, idx) => {
				const rotateBack = typeof this.rotationDirections[index] !== 'undefined' && this.rotationDirections[index][idx] === true;
				return `${prev}${(rotateBack ? '1' : '0')}`; 
			}, previousValue);
		}, '');
		const colors = this.tablets.reduce((previousValue: string, currentValue: Tablet) => {
			return `${previousValue}|${currentValue.toString()}`;
		}, '');
		return `${this.tablets.length}:${this.weaveRows}:${rotDirValue}:${colors}`;
    }

	fromString(input: string): boolean {
		const parts = window.atob(input).split(':');
		if (parts.length !== 4) {
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

		// activate pebble weave, if pattern uses it
		if (parts[3].indexOf("#XXXXXX") >= 0) {
			appConfig.update((ac) => {
				ac.enablePebbleWeave = true;
				return ac;
			});
		}
		
		this.locks = [];
		const initTablets: Tablet[] = parts[3].substring(1).split('|').map(tablet => {
			this.locks.push(false);
			return Tablet.fromString(tablet);
		});
		
		this.weaveRows = numberOfWeaves;
		this.rotationDirections = initRotationDirections;
		this.tablets = initTablets;
		return true;
	}
}

export const appStorage = writable<Storage>(new Storage());

// Update url and local storage with every update
appStorage.subscribe((value: Storage) => {
	if (value && value.tablets.length > 0) {
		const storageHash = window.btoa(value.toString()); 
		window.location.hash = "#" + storageHash;
		localStorage.setItem(LOCAL_STORAGE_KEY, storageHash);
	}
});
