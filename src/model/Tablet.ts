import { Thread } from './Thread';

export class Tablet {
	sDirection: boolean;
	holes: number;
	threads: Thread[];
	
    constructor(sDirection: boolean, holes: number, threads: Thread[]) {
        this.sDirection = sDirection;
        this.holes = holes;
        this.threads = threads;
    }

	toString(): string {
	    return `${(this.sDirection ? '1' : '0')}` + this.threads.reduce((previous: string, current: Thread) => `${previous}${current.toString()}`, '');
    }

	static fromString(tablet: string): Tablet {
		return new Tablet(
			tablet[0] === '1', 
			4, 
			tablet.substring(2).split('#').map(colorCode => {
				return Thread.fromString(colorCode);
			})
		);
	}
}
