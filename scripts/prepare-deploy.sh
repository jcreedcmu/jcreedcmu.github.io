#!/bin/bash

# check we are in jcreedcmu.github.io directory as expected
EXPECTED_DIR="jcreedcmu.github.io"
if [[ $(basename $(pwd)) != ${EXPECTED_DIR} ]]; then
  echo "Not in expected directory! Should be named '${EXPECTED_DIR}'."
  exit 1
fi

rm -rf dist
mkdir dist

# TODO: pass the dist dir to make.ts so it knows where to put things
# directly
./node_modules/.bin/ts-node src/make.ts

# Explicit allow-list of things we want in the tarball
cp -rv demo \
 lib \
 zzz \
 journal \
 js \
 util \
 posts \
 index.html \
 surface \
 style \
 rss.xml \
 self \
 link-svgrepo-com.svg \
 dist/
