#!/bin/bash
if [[ "$(basename $(pwd))" == "snowpack" ]]; then
	cd ..
fi

echo "Compiling JSX files with Babel..."
./node_modules/.bin/babel $@ -d snowpack/dist/ ./src/ \
  --presets @babel/preset-react \
  --plugins @babel/plugin-proposal-optional-chaining \
  --plugins @babel/plugin-proposal-class-properties \
  --plugins ./node_modules/snowpack/assets/babel-plugin.js \
  --plugins ./snowpack/babel-index-import.js

