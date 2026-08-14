module "vpc" {
  source      = "../../modules/vpc"
  environment = "dev"
}

module "rds" {
  source      = "../../modules/rds"
  environment = "dev"
  vpc_id      = module.vpc.vpc_id
}

module "redis" {
  source      = "../../modules/elasticache"
  environment = "dev"
  vpc_id      = module.vpc.vpc_id
}

module "s3" {
  source      = "../../modules/s3"
  environment = "dev"
}

module "ecs" {
  source      = "../../modules/ecs"
  environment = "dev"
  vpc_id      = module.vpc.vpc_id
  api_image   = "lumina-api:dev"
  web_image   = "lumina-web:dev"
}
