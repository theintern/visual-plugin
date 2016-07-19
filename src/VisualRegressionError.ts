import { Report } from './interfaces';

export default class VisualRegressionError extends Error {
	readonly report: Report;

	constructor(message: string, report: Report) {
		super(message);

		this.report = report;
	}
}
