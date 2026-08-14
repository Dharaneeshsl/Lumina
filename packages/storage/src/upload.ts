import { randomUUID } from 'crypto'
import { s3 } from './s3'
import { getBucketName, getRegion } from './utils'
import { PutObjectCommand } from '@aws-sdk/client-s3'

import type { UploadFileOptions } from '@lumina/contracts'

export async function uploadFile({
  buffer,
  mimeType,
  folder,
  fileName,
}: UploadFileOptions): Promise<{ url: string; key: string }> {
  const bucketName = getBucketName()
  const region = getRegion()

  const key = `${folder}/${fileName ?? randomUUID()}`

  console.log({
    bucket: bucketName,
    region,
    key,
  })

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`

  return {
    url,
    key,
  }
}
