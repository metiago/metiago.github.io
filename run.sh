#!/bin/bash
# This is a temporaty script to deploy mom until we get an official bitbucket repository
# Convert windows formatted lines to unix like
dos2unix run.sh

gem install jekyll bundler

bundle update

bundle exec jekyll serve
