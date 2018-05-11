import { DeprecationMessage } from 'intern/lib/executors/Executor';
import Executor from 'intern/lib/executors/Node';
import Suite from 'intern/lib/Suite';
import { VisualRegressionTest } from '../assert';
import ReportWriter, { Options } from './util/ReportWriter';

// NOTE: Due to legacy implmentation details, all types, interfaces, and
// implementation are currently in the ReportWriter module.

/**
 * A Visual Regression Test HTML reporter
 */
export default class VisualRegression {
	protected reportWriter: ReportWriter;

	constructor(executor: Executor, config: Options) {
		this.reportWriter = new ReportWriter(config);

		executor.on('deprecated', message => this.deprecated(message));
		executor.on('error', error => this.error(error));
		executor.on('runEnd', () => this.runEnd());
		executor.on('suiteEnd', suite => <Promise<void>>this.suiteEnd(suite));
		executor.on('testEnd', test => <Promise<void>>this.testEnd(test));
	}

	deprecated(message: DeprecationMessage) {
		this.reportWriter.addNote({
			level: 'warn',
			type: 'deprecated',
			message: `${message.original} is deprecated.${
				message.replacement
					? ` Use ${message.replacement} instead.`
					: ' Please open a ticket if you require access to this feature.'
			}${message.message ? ` ${message.message}` : ''}`
		});
	}

	/**
	 * This method is called when an error occurs within the test system that
	 * is non-recoverable (for example, a bug within Intern).
	 */
	error(error: Error): void {
		// This handler can be called before reportWriter has been initialized
		// if there are errors during reportWriter initialization.
		if (this.reportWriter) {
			this.reportWriter.addNote({
				level: 'fatal',
				type: 'fatal error',
				message: intern.formatError(error)
			});
		}
	}

	/**
	 * This method is called after all test suites have finished running and
	 * the test system is preparing to shut down.
	 */
	runEnd() {
		this.reportWriter.end();
	}

	/**
	 * This method is called when a test suite has finished running.
	 */
	suiteEnd(suite: Suite) {
		if (suite.error) {
			this.reportWriter.addNote({
				level: 'error',
				message: intern.formatError(suite.error),
				type: 'suite error'
			});
		} else {
			return this.reportWriter.writeSuite(suite);
		}
	}

	/**
	 * For fail:
	 *   1. write the diff image
	 *   2. optionally write the screenshot
	 *   3. write report
	 *
	 * For pass:
	 *   1. optionally write the diff image
	 *   2. optionally write the screenshot
	 *   3. write report
	 *
	 * For skip:
	 *   1. write baseline
	 *   2. write report
	 */
	testEnd(test: VisualRegressionTest): Promise<any> {
		return this.reportWriter.writeTest(test);
	}
}
