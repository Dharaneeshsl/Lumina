import { deleteFile } from './delete'
import { s3 } from './s3'
import { uploadFile } from './upload'
import { getBucketName, getRegion } from './utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('./s3', () => ({
  s3: {
    send: vi.fn().mockResolvedValue({}),
  },
}))

describe('storage package env and bucket resolution', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('getBucketName resolves AWS_BUCKET_NAME', () => {
    process.env.AWS_BUCKET_NAME = 'my-bucket'
    delete process.env.AWS_S3_BUCKET_NAME
    expect(getBucketName()).toBe('my-bucket')
  })

  test('getBucketName falls back to AWS_S3_BUCKET_NAME', () => {
    delete process.env.AWS_BUCKET_NAME
    process.env.AWS_S3_BUCKET_NAME = 'fallback-bucket'
    expect(getBucketName()).toBe('fallback-bucket')
  })

  test('getBucketName throws clear error when bucket name is missing', () => {
    delete process.env.AWS_BUCKET_NAME
    delete process.env.AWS_S3_BUCKET_NAME
    expect(() => getBucketName()).toThrow(
      'Missing environment variable: AWS_BUCKET_NAME or AWS_S3_BUCKET_NAME'
    )
  })

  test('getRegion resolves AWS_REGION or AWS_DEFAULT_REGION', () => {
    process.env.AWS_REGION = 'us-west-2'
    expect(getRegion()).toBe('us-west-2')

    delete process.env.AWS_REGION
    process.env.AWS_DEFAULT_REGION = 'us-east-1'
    expect(getRegion()).toBe('us-east-1')
  })

  test('deleteFile sends DeleteObjectCommand with correct Bucket name', async () => {
    process.env.AWS_BUCKET_NAME = 'test-bucket'
    await deleteFile('test-key.png')
    expect(s3.send).toHaveBeenCalledTimes(1)
    const commandCall = (s3.send as any).mock.calls[0][0]
    expect(commandCall.input.Bucket).toBe('test-bucket')
    expect(commandCall.input.Key).toBe('test-key.png')
  })

  test('uploadFile sends PutObjectCommand with correct Bucket name', async () => {
    process.env.AWS_BUCKET_NAME = 'test-bucket'
    process.env.AWS_REGION = 'eu-north-1'
    const result = await uploadFile({
      buffer: Buffer.from('hello'),
      mimeType: 'text/plain',
      folder: 'uploads',
      fileName: 'test.txt',
    })

    expect(s3.send).toHaveBeenCalledTimes(1)
    const commandCall = (s3.send as any).mock.calls[0][0]
    expect(commandCall.input.Bucket).toBe('test-bucket')
    expect(commandCall.input.Key).toBe('uploads/test.txt')
    expect(result.url).toBe('https://test-bucket.s3.eu-north-1.amazonaws.com/uploads/test.txt')
  })
})
