#!/bin/bash
if [[ "$(basename $(pwd))" == "scripts" ]]; then
	cd ..
fi
./scripts/babel.sh --verbose
./scripts/build-static.sh
echo "Build complete"
