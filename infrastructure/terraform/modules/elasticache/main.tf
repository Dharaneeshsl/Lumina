variable "environment" {
  type        = string
  description = "Target deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "Associated VPC ID"
}

output "redis_endpoint" {
  value       = "lumina-redis-${var.environment}.cache.amazonaws.com:6379"
  description = "ElastiCache Redis endpoint"
}
