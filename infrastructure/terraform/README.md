# Infrastructure as Code (Terraform)

Lumina infrastructure is codified using Terraform under `infrastructure/terraform/`.

## Directory Structure

```text
infrastructure/terraform/
├── environments/
│   ├── dev/
│   │   └── main.tf
│   ├── staging/
│   │   └── main.tf
│   └── production/
│       └── main.tf
├── modules/
│   ├── ecs/          # AWS ECS Fargate Task & Service definitions
│   ├── elasticache/  # Redis cluster configuration
│   ├── rds/          # PostgreSQL RDS instance configuration
│   ├── s3/           # S3 asset storage bucket configuration
│   └── vpc/          # VPC, Subnets, and Gateways
└── README.md
```

## Environment Deployment Guide

### 1. Initialize Environment Workspace

```bash
cd infrastructure/terraform/environments/production
terraform init
```

### 2. Plan Infrastructure Execution

```bash
terraform plan
```

### 3. Apply Infrastructure Changes

```bash
terraform apply
```
