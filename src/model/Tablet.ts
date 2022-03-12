import type { Thread } from './Thread';

export class Tablet {
	sDirection: boolean;
	holes: number;
	threads: Thread[];
	
    constructor(sDirection: boolean, holes: number, threads: Thread[]) {
        this.sDirection = sDirection;
        this.holes = holes;
        this.threads = threads;
    }
}
