---
layout: post
title:  Designing Technical Documents
date:   2016-12-21 20:18:00 +0100
category: Dev
tags: architecture
---

When we are developing a product or even fixing a bug it's really important to document all the scope of it. 
Technical specs have immense benefits to everyone involved in a project: the engineers who write them, the teams that use them, even the projects that are designed off of them. Here are some reasons why you should write one. 

A technical spec is a straightforward and efficient way to communicate project design ideas between a team and other stakeholders. The whole team can  collaboratively solve a problem and create a solution. As more teammates and stakeholders contribute to a spec, it makes them more invested in the project and encourages them to take ownership and responsibility for it. With everyone on the same page, it limits complications that may arise from overlapping work. Newer teammates unfamiliar with the project can onboard themselves and contribute to the implementation earlier.  

#### Example

#### Front matter

1. Title
1. Author(s)
1. Team
1. Reviewer(s)
1. Created on
1. Last updated
1. Epic, ticket, issue, or task tracker reference link

#### Overview, Problem Description, Summary, or Abstract

Summary of the problem (from the perspective of the user), the context, suggested solution, and the stakeholders. 

#### Glossary  or Terminology
New terms you come across as you research your design or terms you may suspect your readers/stakeholders not to know.  

#### Context or Background
Reasons why the problem is worth solving

Origin of the problem

How the problem affects users and company goals

Past efforts made to solve the solution and why they were not effective

How the product relates to team goals, OKRs

How the solution fits into the overall product roadmap and strategy

How the solution fits into the technical strategy

#### Problem Statement

Describe what you are trying to solve. Reference JIRAs etc. as needed.

#### Goals

List goals you are planning on achieving with the project/feature.

1. Goal 1
2. Goal 2
3. Goal 3

#### Non-Goals

List anything that should be called out explicitly as a non-goal (i.e., things
that would not be addressed with this project/feature). This section is
optional and can be left blank.

#### Design

One-pager of the design and implementation plan. Can be high level and does not
need to call out explicit functional code, though it is up to the owner on how
deep they want to go.

#### API

What API endpoints will be exposed to the user as part of this feature?

#### Dependencies

List any external component and/or cross functional dependencies.

#### Testing

#### Functional Testing

Plan for functional testing (automated, non-automated, etc).

#### Performance Testing

Plan for performance testing (automated, non-automated, etc) if needed.

#### Scale Testing

Plan for scale testing (automated, non-automated, etc) if needed.