import { readFile } from 'node:fs/promises'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import drive from '@adonisjs/drive/services/main'

export default class UploadsController {
  async store({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    })

    if (!file) {
      return response.badRequest({ errors: [{ message: 'No file provided' }] })
    }

    if (!file.isValid) {
      return response.badRequest({ errors: file.errors })
    }

    const fileName = `${cuid()}.${file.extname}`
    const key = `uploads/${fileName}`
    const contents = await readFile(file.tmpPath!)

    await drive.use('s3').put(key, contents)

    // Return only the storage key — the API resolves it to a full URL at serialization time
    return { key }
  }

  /** Public upload for widget — accepts images and videos up to 10MB */
  async publicStore({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'],
    })

    if (!file) {
      return response.badRequest({ errors: [{ message: 'No file provided' }] })
    }

    if (!file.isValid) {
      return response.badRequest({ errors: file.errors })
    }

    const fileName = `${cuid()}.${file.extname}`
    const key = `uploads/${fileName}`
    const contents = await readFile(file.tmpPath!)

    await drive.use('s3').put(key, contents)

    return { key }
  }
}
