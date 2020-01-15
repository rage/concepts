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
splock=$(cat snowpack.lock 2>/dev/null)
shasum=$(sha256sum yarn.lock)
if [[ "$splock" != "$shasum" ]]; then
	echo "$shasum" > snowpack.lock
	./node_modules/.bin/snowpack --dest ./snowpack/dist/web_modules
fi
cd snowpack/
# pwd: snowpack
./scripts/build-static.sh
./scripts/babel.sh --verbose --watch
