# Tablet waving pattern helper

A small tool to create a preview and instructions for a custom tablet weaving pattern: https://resah.github.io/tablet-weaving/

Still work in progress and currently supports the following features:

* Change number of 4-hole tablets
* Set thread colors for each hole
* Set initial S/Z-direction for each tablet
* Switch rotation direction for each row
* Pattern is stored in local storage
* Show back of pattern
* Switch rotation direction for a single tablet
* Link to pattern by URL

Planned features:
* Reset all values to defaults
* Set number of holes for tablets
* "Missed hole“ or "pebble weave" and selecting weft (thread) colour
* Setting thread thickness
* Custom colour picker
* Inverted view (bottom-up, which seems to be used more often)
* Select template: "threaded in pattern", "double face", "3/1 broken twill", ...
* PWA

Not planned for now:
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
