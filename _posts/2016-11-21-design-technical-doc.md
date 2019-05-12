---
layout: default
title:  Designing Technical Documents
date:   2015-12-21 20:18:00 +0100
category: Dev
---

#### Designing Technical Documents

When we are developing a product or even fixing a bug it's really important to document all the scope of it. Below
we have a template that I think that it is very useful to help other possible developers understand what was done. 

# Design Doc Title

## Stakeholders

List stakeholders for project/feature.

| Role					| Person			|
|-----------------------|-------------------|
| Dev Owner 			|					|
| Other Dev 1 (Engine)	|					|
| Other Dev 2 (Hub)		|					|
| Product				|					|
| Docs					|					|
| QA					|					|
| Program Management	|					|
| UX					|					|

## Problem Statement

Describe what you are trying to solve. Reference JIRAs etc. as needed.

## Goals

List goals you are planning on achieving with the project/feature.

1. Goal 1
2. Goal 2
3. Goal 3

## Non-Goals

List anything that should be called out explicitly as a non-goal (i.e., things
that would not be addressed with this project/feature). This section is
optional and can be left blank.

## Design

One-pager of the design and implementation plan. Can be high level and does not
need to call out explicit functional code, though it is up to the owner on how
deep they want to go.

## API

What API endpoints will be exposed to the user as part of this feature?

## Dependencies

List any external component and/or cross functional dependencies.

## Testing

### Functional Testing

Plan for functional testing (automated, non-automated, etc).

### Performance Testing

Plan for performance testing (automated, non-automated, etc) if needed.

### Scale Testing

Plan for scale testing (automated, non-automated, etc) if needed.