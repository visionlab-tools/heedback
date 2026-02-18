import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: 's3',

  services: {
    s3: services.s3({
      credentials: {
        accessKeyId: env.get('S3_ACCESS_KEY', ''),
        secretAccessKey: env.get('S3_SECRET_KEY', ''),
      },
      region: env.get('S3_REGION', 'us-east-1'),
      bucket: env.get('S3_BUCKET', 'heedback'),
      // Required for MinIO / self-hosted S3 compatibility
      endpoint: env.get('S3_ENDPOINT'),
      forcePathStyle: true,
      visibility: 'public',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
