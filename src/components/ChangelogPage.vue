<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { RiArrowDownSLine, RiGithubFill } from '@remixicon/vue'
import heroBackground from '../assets/optimized/cta_bg.webp'
import { useI18n } from '../i18n'
import { commitHistoryUrl, fetchRoveCommits, repositoryUrl, type RepositoryCommit } from '../roveRepository'

const { locale, messages } = useI18n()
const copy = computed(() => messages.value.changelogPage)
const dayFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long' }))
const monthFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long' }))
const yearMonthFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long' }))

const kinds = ['all', 'feat', 'fix', 'other'] as const
type Filter = (typeof kinds)[number]
type Kind = Exclude<Filter, 'all'>
type TimelineCommit = RepositoryCommit & { day: string; title: string; summary: string; kind: Kind }

const commits = shallowRef<RepositoryCommit[]>([])
const syncStatus = ref<'syncing' | 'live' | 'snapshot' | 'error'>('syncing')
const controller = new AbortController()
const savedHistory = import('../data/rove-commits.json').then(module => module.default).catch(() => [])
const selectedMonth = ref('')
const selectedKind = ref<Filter>('all')
const timeline = ref<HTMLElement | null>(null)
const batchSize = 12
const visibleCount = ref(batchSize)

function displayCommit(commit: RepositoryCommit): TimelineCommit {
  const date = new Date(commit.date)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`
  const [subject = '', ...lines] = commit.message.trim().split(/\r?\n/)
  const prefix = /^(feat|fix|perf|refactor|docs|build|ci|chore|test|style|revert)(?:\([^)]+\))?!?:\s+/i.exec(subject)
  const type = prefix?.[1].toLowerCase()
  const kind = type === 'feat' || type === 'fix' ? type : 'other'
  const summary = lines.join('\n').trim().split(/\n\s*\n/)[0]
    .split('\n').filter(line => !/^(?:Co-authored-by|Signed-off-by):/i.test(line)).join(' ').trim()
  return {
    ...commit,
    day,
    title: subject.slice(prefix?.[0].length ?? 0) || commit.sha.slice(0, 7),
    summary: summary.length > 280 ? `${summary.slice(0, 279).trimEnd()}…` : summary,
    kind,
  }
}

const months = computed(() => {
  const grouped = new Map<string, TimelineCommit[]>()
  for (const commit of [...commits.value].sort((a, b) => b.date.localeCompare(a.date))) {
    const entry = displayCommit(commit)
    const month = entry.day.slice(0, 7)
    if (!grouped.has(month)) grouped.set(month, [])
    grouped.get(month)?.push(entry)
  }
  return grouped
})

const years = computed(() => {
  const grouped = new Map<string, string[]>()
  for (const month of months.value.keys()) {
    const year = month.slice(0, 4)
    if (!grouped.has(year)) grouped.set(year, [])
    grouped.get(year)?.push(month)
  }
  return [...grouped]
})

const activeMonth = computed(() => months.value.has(selectedMonth.value) ? selectedMonth.value : months.value.keys().next().value ?? '')
const matchingCommits = computed(() => (months.value.get(activeMonth.value) ?? [])
  .filter(commit => selectedKind.value === 'all' || selectedKind.value === commit.kind))

const visibleDays = computed(() => {
  const grouped = new Map<string, TimelineCommit[]>()
  for (const commit of matchingCommits.value.slice(0, visibleCount.value)) {
    if (!grouped.has(commit.day)) grouped.set(commit.day, [])
    grouped.get(commit.day)?.push(commit)
  }
  return [...grouped]
})

watch([activeMonth, selectedKind], () => { visibleCount.value = batchSize })

function monthLabel(month: string) {
  return monthFormatter.value.format(new Date(`${month}-01T00:00:00`))
}

function selectMonth(month: string) {
  selectedMonth.value = month
  const element = timeline.value
  if (!element) return
  const inset = parseFloat(getComputedStyle(element).scrollMarginTop)
  if (element.getBoundingClientRect().top < inset) element.scrollIntoView({ behavior: 'instant' })
}

async function showMore() {
  const firstNewCommit = matchingCommits.value[visibleCount.value]
  visibleCount.value += batchSize
  await nextTick()
  document.getElementById(`commit-${firstNewCommit?.sha}`)?.focus()
}

async function refresh() {
  syncStatus.value = 'syncing'
  const snapshot = await savedHistory
  commits.value = snapshot
  if (controller.signal.aborted) return
  try {
    commits.value = await fetchRoveCommits(snapshot, controller.signal)
    syncStatus.value = 'live'
  } catch {
    if (!controller.signal.aborted) syncStatus.value = snapshot.length ? 'snapshot' : 'error'
  }
}

onMounted(refresh)
onUnmounted(() => controller.abort())
</script>

<template>
  <main class="changelog" aria-labelledby="changelog-page-title">
    <header class="changelog-hero" :style="{ backgroundImage: `url(${heroBackground})` }">
      <div>
        <h1 id="changelog-page-title" tabindex="-1">{{ copy.title }}</h1>
        <p>{{ copy.description }}</p>
      </div>
      <a class="history-link" :href="commitHistoryUrl" target="_blank" rel="noopener noreferrer">
        <RiGithubFill aria-hidden="true" />
        {{ copy.githubHistory }}
      </a>
    </header>

    <div ref="timeline" class="timeline">
      <nav v-if="years.length" class="archive" :aria-label="copy.month">
        <h2>{{ copy.archive }}</h2>
        <details v-for="[year, yearMonths] in years" :key="year" :open="yearMonths.includes(activeMonth)">
          <summary>{{ year }} <RiArrowDownSLine aria-hidden="true" /></summary>
          <ul>
            <li v-for="month in yearMonths" :key="month">
              <button type="button" :aria-current="activeMonth === month ? 'date' : undefined" @click="selectMonth(month)">
                {{ monthLabel(month) }}
              </button>
            </li>
          </ul>
        </details>
      </nav>

      <div class="timeline-content">
        <div class="timeline-toolbar">
          <div class="mobile-archive" v-if="years.length">
            <select :aria-label="copy.month" :value="activeMonth" @change="selectMonth(($event.target as HTMLSelectElement).value)">
              <optgroup v-for="[year, yearMonths] in years" :key="year" :label="year">
                <option v-for="month in yearMonths" :key="month" :value="month">{{ yearMonthFormatter.format(new Date(`${month}-01T00:00:00`)) }}</option>
              </optgroup>
            </select>
            <RiArrowDownSLine aria-hidden="true" />
          </div>
          <div class="filters" role="group" :aria-label="copy.filter">
            <button v-for="kind in kinds" :key="kind" type="button" :aria-pressed="selectedKind === kind" @click="selectedKind = kind">
              {{ copy.kinds[kind] }}
            </button>
          </div>
        </div>

        <div v-if="syncStatus !== 'live'" class="sync-status">
          <span role="status">{{ copy[syncStatus] }}</span>
          <button v-if="syncStatus !== 'syncing'" type="button" @click="refresh">{{ copy.retry }}</button>
        </div>

        <p v-if="!visibleDays.length && (syncStatus === 'live' || (syncStatus === 'snapshot' && commits.length))" class="empty-state" role="status">
          {{ copy.empty }}
        </p>

        <section v-for="[day, entries] in visibleDays" :key="day" :aria-labelledby="`date-${day}`" class="commit-day">
          <h2 :id="`date-${day}`"><time :datetime="day">{{ dayFormatter.format(new Date(`${day}T00:00:00`)) }}</time></h2>
          <div class="commit-grid">
            <article v-for="commit in entries" :key="commit.sha" class="commit" :class="{ 'commit--lead': commit === matchingCommits[0] }">
              <h3>
                <a :id="`commit-${commit.sha}`" :href="`${repositoryUrl}/commit/${commit.sha}`" target="_blank" rel="noopener noreferrer">{{ commit.title }}</a>
              </h3>
              <p v-if="commit.summary" class="commit-summary">{{ commit.summary }}</p>
              <div class="commit-meta">
                <span class="commit-kind" :class="`commit-kind--${commit.kind}`">{{ copy.badges[commit.kind] }}</span>
                <span class="commit-author">{{ commit.author }}</span>
                <code>{{ commit.sha.slice(0, 7) }}</code>
              </div>
            </article>
          </div>
        </section>

        <button v-if="visibleCount < matchingCommits.length" class="load-more" type="button" @click="showMore">
          {{ copy.more }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.changelog {
  --ink: #22262f;
  --muted: #606576;
  --line: #e4e6ed;
  --accent: #514db5;
  --display-font: Georgia, 'Songti SC', SimSun, serif;
  width: min(1328px, calc(100% - 96px));
  margin-inline: auto;
  padding: 24px 0 96px;
}
.changelog-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  min-height: clamp(220px, 20vw, 270px);
  padding: clamp(34px, 4vw, 56px) clamp(36px, 5vw, 72px);
  border: 1px solid #b5c8ed;
  border-radius: 28px;
  background: #d6e4ff center / cover;
  box-shadow: inset 0 1px 0 #ffffff99;
}
.changelog-hero h1 {
  width: fit-content;
  scroll-margin-top: 170px;
  font: 400 clamp(3.5rem, 7vw, 6.5rem) / .98 var(--display-font);
  letter-spacing: -.06em;
}
.changelog-hero h1:focus { outline: none; }
.changelog-hero h1:lang(zh) { font-size: clamp(3rem, 6vw, 5.3rem); line-height: 1.12; letter-spacing: -.035em; }
.changelog-hero p { margin-top: 17px; color: #384562; font-size: clamp(1rem, 1.5vw, 1.25rem); line-height: 1.5; }
.history-link {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid #91a4d0;
  border-radius: 999px;
  background: #ffffffb3;
  color: #283650;
  text-decoration: none;
}
.history-link:hover { background: #fff; }
.history-link svg { width: 19px; height: 19px; }
.timeline {
  display: grid;
  grid-template-columns: clamp(150px, 17vw, 224px) minmax(0, 1fr);
  gap: clamp(28px, 5vw, 72px);
  margin: clamp(38px, 4.6vw, 64px) clamp(0px, 2.3vw, 32px) 0;
  scroll-margin-top: 124px;
}
.archive {
  position: sticky;
  top: 124px;
  grid-column: 1;
  align-self: start;
  max-height: calc(100dvh - 148px);
  overflow: auto;
  padding: 3px 10px 8px 5px;
}
.archive h2 {
  margin-bottom: 10px;
  color: var(--muted);
  font-size: .875rem;
  font-weight: 500;
}
.archive details + details { margin-top: 12px; }
.archive summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding-inline: 2px 12px;
  list-style: none;
  font-size: 1.25rem;
  font-weight: 500;
  cursor: pointer;
}
.archive summary::-webkit-details-marker { display: none; }
.archive summary svg { width: 18px; height: 18px; color: var(--muted); }
.archive details[open] summary svg { transform: rotate(180deg); }
.archive ul { display: grid; gap: 2px; margin: 2px 0 0; padding: 0; list-style: none; }
.archive button {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 42px;
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--muted);
  text-align: start;
}
.archive button::before { content: ''; width: 6px; height: 6px; border-radius: 99px; background: #c2c6d3; }
.archive button:hover { background: #f6f6fa; }
.archive button[aria-current] { background: #eeeffd; color: #35318e; font-weight: 500; }
.archive button[aria-current]::before { height: 14px; background: #6259d9; }
.timeline-content { grid-column: 2; min-width: 0; }
.timeline-toolbar, .filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.timeline-toolbar { justify-content: space-between; }
.mobile-archive { display: none; }
.changelog button, .changelog select { font: inherit; cursor: pointer; }
.changelog button:focus-visible, .changelog summary:focus-visible, .changelog select:focus-visible {
  outline: 2px solid #6955f6;
  outline-offset: 2px;
}
.filters button, .load-more {
  min-height: 42px;
  padding: 7px 14px;
  border: 1px solid #cdd0dc;
  border-radius: 999px;
  background: #fff;
  color: var(--muted);
}
.filters button:hover, .load-more:hover { background: #f4f5fa; color: var(--ink); }
.filters button[aria-pressed='true'] { border-color: var(--ink); background: var(--ink); color: #fff; }
.sync-status { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin-top: 12px; color: var(--muted); font-size: .875rem; }
.sync-status button { padding: 6px 2px; border: 0; background: none; color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.empty-state { margin-top: 32px; color: var(--muted); }
.commit-day { margin-top: 36px; }
.commit-day + .commit-day { margin-top: 48px; padding-top: 26px; border-top: 1px solid var(--line); }
.commit-day h2 { color: var(--muted); font-size: .9375rem; font-weight: 500; }
.commit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px clamp(28px, 4vw, 58px); margin-top: 16px; }
.commit { min-width: 0; overflow-wrap: anywhere; }
.commit h3 { margin: 0; font-size: clamp(1.15rem, 1.65vw, 1.5rem); font-weight: 500; line-height: 1.28; }
.commit h3 a { text-decoration: none; scroll-margin-top: 160px; }
.commit h3 a:hover { color: var(--accent); text-decoration: underline; text-underline-offset: .15em; }
.commit--lead { grid-column: 1 / -1; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
.commit--lead h3 { max-width: 20ch; font: 400 clamp(2.5rem, 4.7vw, 4.35rem) / 1.03 var(--display-font); letter-spacing: -.045em; text-wrap: balance; }
.commit--lead h3:lang(zh) { line-height: 1.16; }
.commit-summary { max-width: 62ch; margin-top: 8px; color: var(--muted); line-height: 1.55; }
.commit-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 12px; color: var(--muted); font-size: .875rem; }
.commit--lead .commit-meta { margin-top: 20px; }
.commit-meta code { color: #606576; font-size: .8125rem; }
.commit-kind { padding: 2px 9px; border: 1px solid #dce0e9; border-radius: 999px; background: #f6f7fa; font-size: .8125rem; }
.commit-kind--feat { border-color: #dedcfb; background: #f0efff; color: #4740a7; }
.commit-kind--fix { border-color: #d7e8e7; background: #eef7f7; color: #305c60; }
.load-more { margin-top: 36px; }

@media (max-width: 1199px) {
  .changelog { width: calc(100% - 64px); }
}

@media (max-width: 760px) {
  .changelog { width: calc(100% - 40px); padding: 16px 0 64px; }
  .changelog-hero { align-items: start; flex-direction: column; justify-content: end; gap: 18px; padding: 28px; border-radius: 20px; }
  .changelog-hero h1 { font-size: clamp(2.75rem, 11vw, 4.5rem); }
  .changelog-hero h1:lang(zh) { font-size: clamp(2.5rem, 10vw, 4rem); }
  .changelog-hero p { margin-top: 10px; }
  .timeline { display: block; margin-inline: 0; scroll-margin-top: 160px; }
  .timeline-toolbar { justify-content: flex-start; gap: 10px 16px; }
  .archive { display: none; }
  .mobile-archive { position: relative; display: block; width: fit-content; }
  .mobile-archive select { appearance: none; min-height: 42px; padding: 7px 34px 7px 12px; border: 1px solid #cdd0dc; border-radius: 8px; background: #fff; color: var(--ink); }
  .mobile-archive svg { position: absolute; top: 12px; right: 10px; width: 18px; height: 18px; color: var(--muted); pointer-events: none; }
}

@media (max-width: 520px) {
  .changelog-hero { padding-inline: 20px; }
  .commit-grid { grid-template-columns: 1fr; gap: 24px; }
  .commit-day { margin-top: 26px; }
  .commit-day + .commit-day { margin-top: 34px; }
  .commit--lead h3 { font-size: clamp(2rem, 8.7vw, 2.5rem); }
  .filters { gap: 6px; }
  .filters button { padding-inline: 10px; }
}
</style>
