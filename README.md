# Tablet waving pattern helper

A small tool to create a preview and instructions for a custom tablet weaving pattern: https://resah.github.io/tablet-weaving/

Still work in progress.

### Features

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
* Convenience:
  * Minimize instructions panel
  * Minimize back view
  * Colour helper


### Planned features

* Start screen with template selection
* Template selection from modal (instead menu)
* Lock direction switches for columns (to allow easier outer supporting weaves)
* Share copy-paste menu entry
* "Missed hole“ or "pebble weave"
* Set number of holes for tablets
* Custom colour picker (maybe selectable from different versions)
* Inverted view (bottom-up, which seems to be used more often)
* PWA

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

Navigate to [localhost:5000](http://localhost:5000). You should see your app running.
