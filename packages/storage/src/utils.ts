export function getBucketName(): string {
  const bucket = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME
  if (!bucket) {
    throw new Error('Missing environment variable: AWS_BUCKET_NAME or AWS_S3_BUCKET_NAME')
  }
  return bucket
}

export function getRegion(): string {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  if (!region) {
    throw new Error('Missing environment variable: AWS_REGION')
  }
  return region
}
