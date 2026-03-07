const CHUNK_SIZE = 800
const CHUNK_OVERLAP = 200

export default class EmbeddingService {
  /** Generate embeddings via OpenAI text-embedding-3-small. */
  static async embed(apiKey: string, texts: string[]): Promise<number[][]> {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
      }),
      signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`OpenAI Embeddings API error (${res.status}): ${text.slice(0, 500)}`)
    }

    const data = await res.json() as {
      data: Array<{ embedding: number[]; index: number }>
    }

    return data.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding)
  }

  /**
   * Split article content into overlapping chunks for embedding.
   * Each chunk is prefixed with the article title for context.
   */
  static chunkArticle(title: string, body: string): string[] {
    const words = body.split(/\s+/)
    if (words.length <= CHUNK_SIZE) {
      return [`${title}\n\n${body}`]
    }

    const chunks: string[] = []
    let start = 0

    while (start < words.length) {
      const end = Math.min(start + CHUNK_SIZE, words.length)
      const chunkText = words.slice(start, end).join(' ')
      chunks.push(`${title}\n\n${chunkText}`)
      start += CHUNK_SIZE - CHUNK_OVERLAP
    }

    return chunks
  }
}
