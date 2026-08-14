module "vpc" {
  source      = "../../modules/vpc"
  environment = "staging"
}

module "rds" {
  source      = "../../modules/rds"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
}

module "redis" {
  source      = "../../modules/elasticache"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
}

module "s3" {
  source      = "../../modules/s3"
  environment = "staging"
}

module "ecs" {
  source      = "../../modules/ecs"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
  api_image   = "lumina-api:staging"
  web_image   = "lumina-web:staging"
}
