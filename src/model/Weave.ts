export class Weave {
	color: string;
	sDirection: boolean;
	empty: boolean = false;

    constructor(color: string, sDirection: boolean, empty: boolean = false) {
        this.color = color;
		this.sDirection = sDirection;
		this.empty = empty;
    }
}
