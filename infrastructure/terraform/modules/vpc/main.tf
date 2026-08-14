variable "environment" {
  type        = string
  description = "Target deployment environment (dev, staging, production)"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for the VPC"
}

output "vpc_id" {
  value       = "vpc-lumina-${var.environment}-stub"
  description = "Generated VPC Identifier"
}

output "public_subnet_ids" {
  value       = ["subnet-pub-1", "subnet-pub-2"]
  description = "Public subnet identifiers"
}

output "private_subnet_ids" {
  value       = ["subnet-priv-1", "subnet-priv-2"]
  description = "Private subnet identifiers"
}
