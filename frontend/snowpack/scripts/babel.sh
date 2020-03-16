#!/bin/bash
if [[ "$(basename $(pwd))" == "snowpack" ]]; then
	cd ..
fi

echo "Compiling JSX files with Babel..."
mkdir -p snowpack/dist/
cd snowpack/dist/
../../node_modules/.bin/babel $@ -d . ../../src/ \
  --presets @babel/preset-react \
  --plugins @babel/plugin-proposal-optional-chaining \
  --plugins @babel/plugin-proposal-class-properties \
  --plugins ../../node_modules/snowpack/assets/babel-plugin.js \
  --plugins ../babel-index-import.js
cd ../../
