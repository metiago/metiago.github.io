---
title: 'VPC & Networking'
date: "2014-07-03"
draft: false
---

If you creating an IPSEC connection between your corporate LAN and your VPC, use a CIDR that is different than that on your corporate LAN. This will prevent routing overlaps and create an identity distinction for reference.

For very large networks, use at least different 16-bit masks in different regions eg
```bash
eu-west-1 10.1.0.0/16
us-east-1 10.2.0.0/16
us-west-1 10.3.0.0/16
```

For smaller networks, use a 24-bit mask in different regions eg

```bash
eu-west-1 10.0.1.0/24
us-east-1 10.0.2.0/24
us-west-1 10.0.3.0/24
```

The differences between CIDR blocks of /24 and /16 lie primarily in the number of IP addresses they encompass and the size of the network they represent:

CIDR Block of /24:

Represents a smaller network segment.
Contains 256 IP addresses (2^32 - 2^24).
Suitable for smaller-scale deployments or scenarios where fewer IP addresses are needed.
Typically used for individual subnets within a larger network, such as within a VPC.
CIDR Block of /16:

Represents a larger network segment.
Contains 65,536 IP addresses (2^32 - 2^16).
Suitable for larger-scale deployments or scenarios where a significant number of IP addresses are required.
Often used to define the overall address space for a VPC or to represent a larger portion of an organization's network infrastructure.