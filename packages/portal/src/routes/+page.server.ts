import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

/** No org slug provided — show error */
export const load: PageServerLoad = async () => {
  throw error(404, 'No organization specified. Please use /{org-slug} to access the portal.')
}
