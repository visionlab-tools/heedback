export function createChangelogPageState(data: any) {
  function getTitle(): string {
    return data.entry.translations?.[0]?.title || 'Untitled'
  }

  function labelBadgeClass(label: string): string {
    const map: Record<string, string> = {
      new: 'bg-green-100 text-green-800',
      improvement: 'bg-blue-100 text-blue-800',
      fix: 'bg-orange-100 text-orange-800',
      breaking: 'bg-red-100 text-red-800',
    }
    return map[label] || 'bg-gray-100 text-gray-800'
  }

  return {
    getTitle,
    labelBadgeClass,
  }
}
