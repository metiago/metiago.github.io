#!/bin/sh

git config --global user.email "tiagotg.ribeiro@gmail.com"
git config --global user.name "tiago"

rm -rf site

mkdocs build

git add .

git commit -m "..."

git push origin master