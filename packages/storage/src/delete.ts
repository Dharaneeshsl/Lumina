import { s3 } from './s3'
import { getBucketName } from './utils'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function deleteFile(key: string): Promise<void> {
  if (!key) {
    throw new Error('File key is required')
  }

  const bucket = getBucketName()

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}
