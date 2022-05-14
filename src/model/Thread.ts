export class Thread {
	color: string;
	empty: boolean = false;

    constructor(color: string, empty: boolean = false) {
        this.color = color;
		this.empty = empty;
    }

	toString(): string {
	    return this.empty ? '#XXXXXX' : `${this.color}`;
    }

	static fromString(colorCode: string): Thread {
		if (colorCode === 'XXXXXX') {
			return new Thread('#FFFFFF', true);
		}
		return new Thread(`#${colorCode}`);
	}
}
