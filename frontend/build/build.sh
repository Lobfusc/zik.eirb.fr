#!/bin/bash
#This script must to be executed with docker
npx @tailwindcss/cli -i ./assets/style.css -o ./dist/assets/style.css --minify
cp -r ./assets/{cover.png,logo.svg,planningStyle.css} ./dist/assets/
cp -r ./js/ ./dist/
for f in ./dist/js/*.js; do
  npx terser "$f" -o "$f" --compress --mangle --ecma 2022
done
for f in ./dist/js/utils/*/*.js; do
  npx terser "$f" -o "$f" --compress --mangle --ecma 2022
done
cp -r ./*.html ./dist/
