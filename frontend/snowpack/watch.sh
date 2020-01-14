#!/bin/sh
babel --verbose --watch -d dist/ ../src/ \
  --presets @babel/preset-react \
  --plugins @babel/plugin-proposal-optional-chaining \
  --plugins @babel/plugin-proposal-class-properties \
  --plugins ./node_modules/snowpack/assets/babel-plugin.js \
  --plugins ./babel-plugin.js
