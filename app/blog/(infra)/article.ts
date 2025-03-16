import { type Article } from '../(domain)/article'
import { mocks } from './mocks'

export async function fetchArticlesByOffset (cursor: number): Promise<Article[]> {
  if (cursor === 0) {
    return mocks.slice(0, 5)
  }
  return mocks.slice(cursor, cursor + 5)
}
