# Intern Visual Regression Testing

This project adds support for visual regression testing in [Intern](https://github.com/theintern/intern).

## Overview

A visual regression test compares a screenshot of a webpage with a previously generated baseline providing the ability
to make automated comparisons against a known-good version to ensure nothing has changed.

These tests can help engineers

* ensure a page is rendered identically on various browsers
* identify when a css change has an undesired effect elsewhere
* put a quick set of visual tests around legacy code to identify regressions 

## Installation

The `intern-visual` package should be installed as a peer of Intern

```
$ npm install intern intern-visual
```

## Quick Start

Ok! You want to see all the great things Visual Regression Testing can do and how to do it! See real test code by
looking in the `tests/visual` directory.

To run our visual regression tests

1. clone this project
1. install some tools `npm install -g grunt-cli typings`
1. `npm install`
1. start selenium
1. `grunt test`

## APIs and Architecture

This Intern plugin can be broken down into three main pieces of functionality. The assertion layer is made up of
`assert` and `test`; they provide a programmatic and configuration based approach, respectively. The comparison layer
is used by the assertion layer to identify differences between the baseline and snapshot images. And the reporting
layer is used by Intern to generate HTML reports.

### assert

`assert` is a module that allows you to compare two sets of images (a baseline and snapshot). It is also responsible
for generating baselines as necessary for future test runs. The method is called during functional testing like this:

```typescript
import assertVisuals from 'visual/assert';

registerSuite({
    test() {
        this.remote()
            .get('https://sitepen.com')
            .setWindowSize(1024, 768)  // set the window size
            .takeScreenshot()
            .then(assertVisuals(this, {
                missingBaseline: 'snapshot'
            }));
    }
})
```

There are a number of options that can be passed to `assert` or set globally. The complete list of options can be 
seen in the module.

*baseline*: explicitly point to a baseline png to use. When this is not defined the test name is used to generate
 a path to a baseline
 
*regenerateBaselines*: when set to true, a new baseline will be automatically generated


### test

`test` provides a wrapper around the `assert` module that will create a visual regression test from configuration.

```typescript
import visualTest from 'visual/test';

registerSuite({
	test: visualTest({
		url: 'https://sitepen.com',
		width: 1024,
		height: 768,
		missingBaseline: 'snapshot',
	});
});
```

### reporters/VisualRegression

The `VisualRegression` reporter is responsible for creating a HTML report that reports (only) on the visual
regression tests. It can be used in combination with other Intern reporters.

```typescript
export reporters = [
    'Runner',
    { id: 'visual/reporters/VisualRegression', baselineLocation: './baselines', reportLocation: './reports' }
]
```

## Contributing

We would love to hear your feedback and welcome PRs. Please take a look at 
 [Intern's Contribution Guidelines](https://github.com/theintern/intern/blob/master/CONTRIBUTING.md) for some info
 and tips. Thanks!
