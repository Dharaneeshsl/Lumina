variable "environment" {
  type        = string
  description = "Target deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "Associated VPC ID"
}

variable "db_instance_class" {
  type        = string
  default     = "db.t4g.micro"
  description = "RDS Postgres Instance Class"
}

output "db_endpoint" {
  value       = "lumina-db-${var.environment}.rds.amazonaws.com:5432"
  description = "RDS PostgreSQL connection endpoint"
}
