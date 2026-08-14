variable "environment" {
  type        = string
  description = "Target deployment environment"
}

output "bucket_name" {
  value       = "lumina-assets-${var.environment}"
  description = "S3 assets bucket name"
}
