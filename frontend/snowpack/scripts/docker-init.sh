#!/bin/bash
if [[ "$(basename $(pwd))" == "scripts" ]]; then
	cd ..
fi
# pwd: snowpack
cd packages/react/ && yarn link
cd ../react-dom/ && yarn link
cd ../react-is/ && yarn link
cd ../prop-types/ && yarn link
cd ../../../
# pwd: frontend
yarn link react && yarn link react-dom && yarn link react-is && yarn link prop-types
yarn
./node_modules/.bin/snowpack --dest ./snowpack/dist
cd snowpack/
# pwd: snowpack
./scripts/build-static.sh
./scripts/babel.sh --verbose --watch
