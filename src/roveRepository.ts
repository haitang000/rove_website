const repository = 'haitang000/RoveBrowser'
export const repositoryUrl = `https://github.com/${repository}`
export const commitHistoryUrl = `${repositoryUrl}/commits/main/`

export interface RepositoryCommit {
  sha: string
  date: string
  author: string
  message: string
}

interface GitHubCommit {
  sha: string
  commit: {
    committer: { date: string }
    author: { name: string }
    message: string
  }
}

export async function fetchRoveCommits(snapshot: RepositoryCommit[], signal: AbortSignal) {
  const commits: RepositoryCommit[] = []
  let revision = 'main'
  for (let page = 1; ; page++) {
    const response = await fetch(`https://api.github.com/repos/${repository}/commits?sha=${revision}&per_page=100&page=${page}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
    })
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
    const entries: GitHubCommit[] = await response.json()
    if (page === 1 && snapshot.length && entries[0]?.sha === snapshot[0].sha) return snapshot
    if (page === 1 && entries.length) revision = entries[0].sha

    for (const { sha, commit } of entries) {
      commits.push({ sha, date: commit.committer.date, author: commit.author.name, message: commit.message })
    }
    if (!response.headers.get('link')?.includes('rel="next"')) return commits
  }
}
