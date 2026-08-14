variable "environment" {
  type        = string
  description = "Target deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "Associated VPC ID"
}

variable "api_image" {
  type        = string
  description = "API ECR Docker image location"
}

variable "web_image" {
  type        = string
  description = "Web ECR Docker image location"
}

output "cluster_name" {
  value       = "lumina-ecs-${var.environment}"
  description = "ECS Fargate Cluster Name"
}

output "api_service_name" {
  value       = "lumina-api-service-${var.environment}"
  description = "API ECS Fargate Service Name"
}
