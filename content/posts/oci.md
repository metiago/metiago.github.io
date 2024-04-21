---
title: 'OCI'
date: 2019-03-27T21:17:20-03:00
draft: true
---

Textual representation of a simplified diagram illustrating the relationship between compartments and networking resources in Oracle Cloud Infrastructure 


            +-------------------------------------------+
            |             OCI Tenancy                   |
            +-------------------------------------------+
                          | (Logical Isolation)
                          |
          +---------------|----------------+
          |               |                |
     +----|--------+ +----|--------+ +-----|--------+
     | Compartment | | Compartment | | Compartment |
     |     (Dev)    | |   (Test)    | |   (Prod)   |
     +--------------+ +-------------+ +------------+
          |                  |                 |
          |                  |                 |
     +----|--------+ +-------|--------+ +------|--------+
     |   VCN       | |    VCN       | |     VCN      |
     |  (Subnets,  | |  (Subnets,   | |   (Subnets,  |
     |  Gateways,  | |  Gateways,  | |   Gateways, |
     |  Route      | |  Route      | |   Route     |
     |  Tables,    | |  Tables,    | |   Tables,   |
     |  Security   | |  Security   | |   Security  |
     |  Lists,     | |  Lists,     | |   Lists,    |
     |  etc.)      | |  etc.)      | |   etc.)     |
     +-------------+ +-------------+ +-------------+

1. The OCI Tenancy represents the top-level organizational unit in OCI.
1. Compartments (e.g., Development, Test, Production) are used to logically segregate resources within the tenancy.
1. Each compartment can contain various networking resources such as Virtual Cloud Networks (VCNs), subnets, gateways, route tables, security lists, etc.
1. Although networking resources are not directly separated by compartments, access to these resources can be controlled using IAM policies attached to compartments.
