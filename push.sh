#!/bin/sh
source venv/bin/activate

mkdocs build

git add .

git commit -m "..."

git push origin master