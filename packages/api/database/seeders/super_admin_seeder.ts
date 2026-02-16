import { BaseSeeder } from '@adonisjs/lucid/seeders'
import AdminUser from '#models/admin_user'
import { v4 as uuid } from 'uuid'
import env from '#start/env'

export default class SuperAdminSeeder extends BaseSeeder {
  async run() {
    const email = env.get('SUPER_ADMIN_EMAIL', 'admin@heedback.com')
    const password = env.get('SUPER_ADMIN_PASSWORD', 'changeme123')

    const existing = await AdminUser.query().where('email', email).first()

    if (existing) {
      console.log(`Super admin already exists: ${email}`)
      return
    }

    await AdminUser.create({
      id: uuid(),
      email,
      password,
      fullName: 'Super Admin',
      isSuperAdmin: true,
    })

    console.log(`Super admin created: ${email}`)
  }
}
