#!/bin/bash
echo "Compiling JSX files with Babel..."
babel $@ -d dist/ ../src/ \
  --presets @babel/preset-react \
  --plugins @babel/plugin-proposal-optional-chaining \
  --plugins @babel/plugin-proposal-class-properties \
  --plugins ./node_modules/snowpack/assets/babel-plugin.js \
  --plugins ./babel-plugin.js

