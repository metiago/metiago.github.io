#!/bin/sh

mkdocs build

git add .

git commit -m "..."

git push origin master