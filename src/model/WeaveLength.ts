import type { YarnLength } from './YarnLength';

export class WeaveLength {
	singleYarnLength: number;
	yarnLengths: YarnLength[];
	
    constructor(singleYarnLength: number, yarnLengths: YarnLength[]) {
        this.singleYarnLength = singleYarnLength;
		this.yarnLengths = yarnLengths;
    }
}
