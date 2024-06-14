#!/bin/sh

rm -rf site

mkdocs build

git add .

git commit -m "..."

git push origin master