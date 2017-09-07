import Suite = require('intern/lib/Suite');
import { getErrorMessage } from 'intern/lib/util';
import { VisualRegressionTest } from '../assert';
import ReportWriter, { ReportConfig } from './util/ReportWriter';

/**
 * A Visual Regression Test HTML reporter
 *
 * NOTE: This module proxies all functionality to the ReportWriter because a reporter must be provided to Intern
 * using CJS (export =) syntax. Because this module can only have one export all types, interfaces, and
 * implementation are in the ReportWriter module.
 */
class VisualRegression {
	protected reportWriter: ReportWriter;

	constructor(config: ReportConfig) {
		this.reportWriter = new ReportWriter(config);
	}

	deprecated(name: string, replacement?: string, extra?: string) {
		this.reportWriter.addNote({
			level: 'warn',
			type: 'deprecated',
			message: `${ name } is deprecated.${ replacement ?
				` Use ${ replacement } instead.` :
				' Please open a ticket if you require access to this feature.'
				}${ extra ? ` ${ extra }` : ''}`
		});
	}

	/**
	 * This method is called when an error occurs within the test system that is non-recoverable
	 * (for example, a bug within Intern).
	 * @param error
	 */
	fatalError(error: Error): void {
		this.reportWriter.addNote({
			level: 'fatal',
			type: 'fatal error',
			message: getErrorMessage(error)
		});
	}

	/**
	 * This method is called when a reporter throws an error during execution of a command.
	 */
	reporterError(_reporter: any, error: Error): void {
		this.reportWriter.addNote({
			level: 'error',
			type: 'reporter error',
			message: getErrorMessage(error)
		});
	}

	/**
	 * This method is called after all test suites have finished running and the test system is preparing
	 * to shut down.
	 * @param executor
	 */
	runEnd(): void {
		this.reportWriter.end();
	}

	/**
	 * This method is called when a test suite has finished running.
	 * @param suite
	 */
	suiteEnd(suite: Suite): Promise<any> {
		return this.reportWriter.writeSuite(suite);
	}

	/**
	 * This method is called when an error occurs within one of the suite’s lifecycle methods (setup, beforeEach, afterEach, or teardown), or when an error occurs when a suite attempts to run a child test.
	 * @param suite
	 * @param error
	 */
	suiteError(_suite: Suite, error: Error): void {
		this.reportWriter.addNote({
			level: 'error',
			message: getErrorMessage(error),
			type: 'suite error'

		});
	}

	/**
	 * 1. write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testFail(test: VisualRegressionTest): Promise<any> {
		return this.reportWriter.writeTest(test);
	}

	/**
	 * 1. optionally write the diff image
	 * 2. optionally write the screenshot
	 * 3. write report
	 */
	testPass(test: VisualRegressionTest): Promise<any> {
		return this.reportWriter.writeTest(test);
	}

	/**
	 * 1. write baseline
	 * 2. write report
	 */
	testSkip(test: VisualRegressionTest): Promise<any> {
		return this.reportWriter.writeTest(test);
	}
}

// ReporterManager looks at the root export as the report, so we need to export using CJS format here :\
export = VisualRegression;
