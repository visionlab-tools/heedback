import { v4 as uuid } from 'uuid'
import Tag from '#models/tag'

export default class TagService {
  async list(orgId: string) {
    const tags = await Tag.query()
      .where('organization_id', orgId)
      .withCount('posts')
      .orderBy('name', 'asc')

    return tags.map((t) => ({
      ...t.serialize(),
      postCount: Number(t.$extras.posts_count),
    }))
  }

  async create(orgId: string, data: { name: string; slug: string; color?: string | null }) {
    const existing = await Tag.query()
      .where('organization_id', orgId)
      .where('slug', data.slug)
      .first()

    if (existing) {
      throw new Error('A tag with this slug already exists')
    }

    const tag = await Tag.create({
      id: uuid(),
      organizationId: orgId,
      name: data.name,
      slug: data.slug,
      color: data.color ?? null,
    })

    return tag
  }

  async update(
    orgId: string,
    tagId: string,
    data: { name?: string; slug?: string; color?: string | null },
  ) {
    const tag = await Tag.query()
      .where('id', tagId)
      .where('organization_id', orgId)
      .first()

    if (!tag) return null

    if (data.slug && data.slug !== tag.slug) {
      const existing = await Tag.query()
        .where('organization_id', orgId)
        .where('slug', data.slug)
        .whereNot('id', tag.id)
        .first()

      if (existing) {
        throw new Error('A tag with this slug already exists')
      }
    }

    tag.merge({
      name: data.name ?? tag.name,
      slug: data.slug ?? tag.slug,
      color: data.color !== undefined ? data.color : tag.color,
    })

    await tag.save()

    return tag
  }

  async delete(orgId: string, tagId: string) {
    const tag = await Tag.query()
      .where('id', tagId)
      .where('organization_id', orgId)
      .first()

    if (!tag) return null

    await tag.delete()

    return true
  }
}
