#!/bin/bash
if [[ "$(basename $(pwd))" == "scripts" ]]; then
	cd ..
fi
./scripts/build-static.sh
./scripts/babel.sh --verbose --watch
