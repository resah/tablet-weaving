![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/resah/tablet-weaving)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tablet Weaving](https://github.com/resah/tablet-weaving/actions/workflows/build-and-publish.yml/badge.svg)](https://github.com/resah/tablet-weaving/actions/workflows/build-and-publish.yml)


# Tablet weaving pattern helper

A small tool to create a preview and instructions for a custom tablet weaving pattern: https://resah.github.io/tablet-weaving/

Still work in progress.

## Features

* Change number of 4-hole tablets
* Set thread colors for each hole
* Set initial S/Z-direction for each tablet
* Switch rotation direction for each row
* Pattern is stored in local storage
* Show back of pattern
* Switch rotation direction for a single tablet
* Link to pattern by URL
* Select template by name
* Setting thread thickness
* SVG view (with dynamic zoom option)
* Option to disable weave outlines
* "Missed hole“ or "pebble weave" (beta)
* Lock direction switches for columns (to allow easier outer supporting weaves)
* Convenience:
  * Minimize instructions panel
  * Minimize back view
  * Colour helper

### Planned features

* Inverted view (bottom-up, which seems to be used more often)
* Weaving helper: mark current row and iterate through rows by pressing space
* Share copy-paste menu entry
* Versioned pattern storage/link
* Changelog 
  * visitor hints about changes
* PDF generation
* Print view
* Mobile view
* Help page with links and resources about tablet weaving
* Set number of holes for tablets
* Custom colour picker (maybe selectable from different versions)
* PWA
* Pattern repeat every X rows
* Translations in pattern selector for pattern attributes

### Not planned for now

* Set number of holes for each tablet individually
* Step without tablet rotation
* Switching tablet positions


## Run locally

Install the dependencies...

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see the app running.
