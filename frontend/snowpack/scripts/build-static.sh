#!/bin/bash
cat ../public/index.html \
  | sed 's/%PUBLIC_URL%//g' \
  | sed -E 's#(</body>)#  <script src="/index.js" type="module"></script>\n  \1#' \
  > dist/index.html
echo "Compiling JSON files to ES modules..."
for in_file in $(find ../src/ -name '*.json'); do
	# Change extension from .json to .js
	out_file="${in_file%.*}.js"
	# Change directory from src/ to dist/
	out_file="dist/${out_file:7}"
	echo "$in_file -> $out_file"
	mkdir -p $(dirname "$out_file")
	echo -n 'export default ' > "$out_file"
	cat "$in_file" >> "$out_file"
done
echo "Symlinking resources"
ln -sfn ../../public/res dist/res
ln -sfn ../../public/guide dist/guide
