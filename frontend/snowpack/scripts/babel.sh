#!/bin/bash
if [[ "$(basename $(pwd))" == "snowpack" ]]; then
	cd ..
fi

echo "Compiling JSX files with Babel..."
cd snowpack/
../node_modules/.bin/babel $@ -d ./dist ../src/
cd ../
