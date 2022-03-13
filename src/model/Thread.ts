export class Thread {
	color: string;

    constructor(color: string) {
        this.color = color;
    }

	toString(): string {
	    return `${this.color}`;
    }

	static fromString(colorCode: string): Thread {
		return new Thread(`#${colorCode}`);
	}
}
