# intern-visual

<!-- prettier-ignore-start -->
<!-- start-github-only -->
<br><p align="center"><img src="https://cdn.rawgit.com/theintern/intern-visual/5115be20a45bec46da24e030c9887968b098c36a/docs/logo.svg" alt="Intern Visual logo" height="128"></p><br>
<!-- end-github-only -->

<!-- start-github-only -->

[![Build Status](https://travis-ci.org/theintern/intern-visual.svg?branch=master)](https://travis-ci.org/theintern/intern-visual)<!-- end-github-only -->
[![Intern](http://theintern.github.io/images/intern-v4.svg)](https://github.com/theintern/intern/)
<!-- prettier-ignore-end -->

This project adds support for visual regression testing to
[Intern](https://theintern.io).

<!-- vim-markdown-toc GFM -->

* [Overview](#overview)
* [Installation](#installation)
* [Quick start](#quick-start)
* [API and architecture](#api-and-architecture)
	* [visualTest](#visualtest)
	* [assertVisuals](#assertvisuals)
	* [helpers](#helpers)
	* [Reporting results](#reporting-results)
* [Contributing](#contributing)

<!-- vim-markdown-toc -->

## Overview

A visual regression test compares a screenshot of a webpage with a previously
generated baseline providing the ability to make automated comparisons against a
known-good version to ensure nothing has changed.

These tests can help engineers

*   ensure a page is rendered identically on various browsers
*   identify when a css change has an undesired effect elsewhere
*   put a quick set of visual tests around legacy code to identify regressions

This plugin takes image snapshots of pages when they’re known to be rendering
properly, and then compares those images to how the page looks at later points
to detect visual regressions.

For example, here's a simple login page:

<p align="center"><img src="https://cdn.rawgit.com/theintern/intern-visual/master/docs/good.png" alt="Good login sample" width="245"></p><br>

Assume you’ve created a visual test called “login page” for this page. The first
time the test is run it will save a snapshot image (a _baseline_) of the page.

At some point, someone may change a style that has a side effect of making `h1`
tags use a serif font. Now the the login page looks like this:

<p align="center"><img src="https://cdn.rawgit.com/theintern/intern-visual/master/docs/bad.png" alt="Bad login sample" width="245"></p><br>

Normal unit tests aren‘t going to see anything wrong here, because the content
is the same. However, the next time the visual test is run for that page it will
fail because the page no longer looks the same. A report will be generated that
highlights the changes:

<p align="center"><img src="https://cdn.rawgit.com/theintern/intern-visual/master/docs/report.png" alt="Visual assertion report"></p><br>

## Installation

The `intern-visual` package should be installed as a peer of Intern

```
$ npm install intern intern-visual --save-dev
```

## Quick start

Ok! You want to see all the great things visual regression testing can do and
how to do it! See some real test code by looking in the
[tests/visual](./tests/visual) directory.

To run our visual regression tests:

1.  Clone this project
1.  Install package dependencies
    ```
    npm install
    ```
1.  Run the tests
    ```
    npm test
    ```

## API and architecture

Intern-visual has three main exports:

*   `visualTest` is a function that will create a complete visual regression
    test based on an options obect
*   `assertVisuals` is a function that can be used to make visual assertions in
    tests
*   `helpers` is an object of functional test helper functions

### visualTest

[visualTest](https://theintern.io/docs.html#intern-visual/1/api/test/visualtest)
is a function that creates a complete visual regression test from a set of
[options](https://theintern.io/docs.html#intern-visual/1/api/test/options).

```ts
import { visualTest }  from 'intern-visual';

registerSuite('mySuite', {
    test: visualTest({
        url: 'https://sitepen.com',
        width: 1024,
        height: 768,
        missingBaseline: 'snapshot',
    });
});
```

### assertVisuals

[assertVisuals](https://theintern.io/docs.html#intern-visual/1/api/assert/assertvisuals)
is a Leadfoot helper function that can be used to provide visual assertion
functionality within an existing Intern test. It provides the assertion
functionality of `visualTest` but without the surrounding logic.

```ts
import { assertVisuals } from 'intern-visual';

registerSuite('mySuite', {
    test() {
        return this.remote()
            .get('https://sitepen.com')
            .setWindowSize(1024, 768)
            .takeScreenshot()
            .then(
                assertVisuals(this, {
                    missingBaseline: 'snapshot'
                })
            );
    }
});
```

See the API docs for the full set of
[options](https://theintern.io/docs.html#intern-visual/1/api/assert/options-1).

### helpers

The `helpers` export currently contains one function,
[resizeWindow](https://theintern.io/docs.html#intern-visual/1/api/helpers%2FresizeWindow/resizeWindow).
This is a convenience function that will resize a browser window and wait for
the resize operation to complete.

### Reporting results

By default intern-visual will generate an HTML report of visual regression test
results in the plugin’s output directory. The reporter supports a couple of
options:

*   `reportLocation`: A directory under the base output directory to write the
    report, defaults to "report"
*   `errorColor`: The color to use when highlighting image differences, defaults
    to "#F00"

```json
"plugins": {
    "script": "intern-visual",
    "options": {
        "missingBaseline": "snapshot",
        "directory": "visual",
        "reportLocation": "htmlreport",
        "errorColor": "#FF7200"
    }
}
```

The reporter can be disabled by setting the `report` configuration option to
`false`.

```json
"plugins": {
    "script": "intern-visual",
    "options": {
        "missingBaseline": "snapshot",
        "directory": "visual",
        "report": false
    }
}
```

## Contributing

We would love to hear your feedback and welcome PRs. Please take a look at
[Intern’s Contribution Guidelines](https://github.com/theintern/intern/blob/master/CONTRIBUTING.md)
for some info and tips. Thanks!

<!-- doc-viewer-config
{
    "api": "docs/api.json"
}
-->
