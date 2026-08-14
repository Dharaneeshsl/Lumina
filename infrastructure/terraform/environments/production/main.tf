module "vpc" {
  source      = "../../modules/vpc"
  environment = "production"
}

module "rds" {
  source            = "../../modules/rds"
  environment       = "production"
  vpc_id            = module.vpc.vpc_id
  db_instance_class = "db.r6g.xlarge"
}

module "redis" {
  source      = "../../modules/elasticache"
  environment = "production"
  vpc_id      = module.vpc.vpc_id
}

module "s3" {
  source      = "../../modules/s3"
  environment = "production"
}

module "ecs" {
  source      = "../../modules/ecs"
  environment = "production"
  vpc_id      = module.vpc.vpc_id
  api_image   = "lumina-api:production"
  web_image   = "lumina-web:production"
}
