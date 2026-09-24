import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const apiBase = 'https://api.github.com';
const repo = process.env.GITHUB_REPOSITORY;
const [owner, repository] = (repo ?? '').split('/');
const visibleReportName = 'font-visible-report.json';
const cmapReportName = 'font-cmap-report.json';
const fontPaths = [
  'public/fonts/noto-sans-tc-site.woff2',
  'scripts/noto-sans-tc-site.coverage.txt',
];
const trackedRanges = [
  [0x3000, 0x30ff], [0x3100, 0x312f], [0x3400, 0x4dbf],
  [0x4e00, 0x9fff], [0xf900, 0xfaff], [0x20000, 0x2fa1f],
];

const tracked = (codePoint) => trackedRanges.some(([start, end]) => codePoint >= start && codePoint <= end);
const formatCodePoint = (codePoint) => `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
const parseCodePoint = (value) => {
  if (typeof value !== 'string' || !/^U\+[0-9A-F]{4,6}$/.test(value)) throw new Error(`Invalid code point: ${value}`);
  const codePoint = Number.parseInt(value.slice(2), 16);
  if (codePoint > 0x10ffff || !tracked(codePoint)) throw new Error(`Code point outside tracked ranges: ${value}`);
  return codePoint;
};

const setOutput = (key, value) => {
  const text = String(value ?? '');
  const delimiter = `FONT_FIX_${randomUUID()}`;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}<<${delimiter}\n${text}\n${delimiter}\n`);
};

const request = async (route, { method = 'GET', body, token, allow404 = false } = {}) => {
  const response = await fetch(`${apiBase}${route}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token ?? process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 404 && allow404) return null;
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text.slice(0, 500) };
  }
  if (!response.ok) throw new Error(`GitHub API ${method} ${route}: ${response.status} ${data.message ?? ''}`.trim());
  return data;
};

const listPages = async (route, token) => {
  const all = [];
  for (let page = 1; page <= 50; page += 1) {
    const separator = route.includes('?') ? '&' : '?';
    const values = await request(`${route}${separator}per_page=100&page=${page}`, { token });
    if (!Array.isArray(values)) throw new Error(`Expected an array from ${route}.`);
    all.push(...values);
    if (values.length < 100) return all;
  }
  throw new Error(`GitHub API result exceeded the safe page limit: ${route}`);
};

const runData = () => JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).workflow_run;
const outputContext = (status, pr, headSha = '') => {
  setOutput('status', status);
  if (pr) {
    setOutput('pr_number', pr.number);
    setOutput('head_sha', headSha || pr.head.sha);
    setOutput('head_ref', pr.head.ref);
    setOutput('base_ref', pr.base.ref);
  }
};

async function classify() {
  const run = runData();
  if (!run || run.name !== 'PR validation' || run.event !== 'pull_request' || run.conclusion !== 'failure') {
    outputContext('skip');
    return;
  }
  if (run.head_repository?.full_name !== repo) {
    outputContext('skip');
    return;
  }

  let related = Array.isArray(run.pull_requests)
    ? run.pull_requests.filter((item) => Number.isInteger(item.number))
    : [];
  if (!related.length && run.head_branch && run.head_sha) {
    const branchPulls = await listPages(
      `/repos/${owner}/${repository}/pulls?state=open&head=${encodeURIComponent(`${owner}:${run.head_branch}`)}`,
      process.env.GITHUB_TOKEN,
    );
    related = branchPulls
      .filter((pr) => pr.head?.sha === run.head_sha && pr.head.repo?.full_name === repo)
      .map((pr) => ({ number: pr.number, head: { sha: pr.head.sha } }));
  }
  if (!related.length) {
    outputContext('stale');
    return;
  }
  const current = [];
  for (const item of related) {
    const pr = await request(`/repos/${owner}/${repository}/pulls/${item.number}`);
    const runHead = item.head?.sha ?? (run.head_sha === pr.head.sha ? run.head_sha : '');
    if (pr.state === 'open' && pr.head.repo?.full_name === repo && pr.head.sha === runHead) {
      current.push({ pr, runHead, relatedRun: item });
    }
  }
  if (current.length !== 1) {
    outputContext('stale');
    return;
  }
  const { pr, runHead, relatedRun } = current[0];
  if (run.head_branch !== pr.head.ref || (run.head_sha !== runHead && relatedRun.head?.sha !== runHead)) {
    outputContext('stale');
    return;
  }
  const baseRef = pr.base?.ref;
  if (!['dev', 'main'].includes(baseRef)) {
    outputContext('skip');
    return;
  }

  const jobs = await request(`/repos/${owner}/${repository}/actions/runs/${run.id}/jobs?per_page=100`);
  const job = jobs.jobs?.find((entry) => entry.name === 'PR validation' && entry.conclusion === 'failure');
  const steps = new Map((job?.steps ?? []).map((step) => [step.name, step]));
  const sharedChecks = [
    'Checkout pull request', 'Setup Node.js 22 with npm cache',
    'Install locked npm dependencies', 'Test public data decoders', 'Build static site with Astro',
  ];
  const releaseChecks = [
    'Setup Python 3.12 with pip cache', 'Install pinned WOFF2 verification tools',
    'Verify static SEO and generated public output', 'Generate Pagefind search index',
  ];
  const visibleCheckRan = ['success', 'failure'].includes(
    steps.get('Check visible Noto Sans TC coverage')?.conclusion,
  );
  const releaseChecksMatchTier = baseRef === 'main'
    ? releaseChecks.every((name) => steps.get(name)?.conclusion === 'success') &&
      ['success', 'failure'].includes(steps.get('Check Noto WOFF2 cmap and variable weight axis')?.conclusion)
    : [...releaseChecks, 'Check Noto WOFF2 cmap and variable weight axis']
      .every((name) => steps.get(name)?.conclusion === 'skipped');

  if (!job || steps.get('Fail if required font checks failed')?.conclusion !== 'failure' ||
      sharedChecks.some((name) => steps.get(name)?.conclusion !== 'success') ||
      !visibleCheckRan || !releaseChecksMatchTier) {
    outputContext('skip');
    return;
  }

  const changedFiles = await listPages(`/repos/${owner}/${repository}/pulls/${pr.number}/files`, process.env.GITHUB_TOKEN);
  const fontsChanged = changedFiles.some((file) => fontPaths.includes(file.filename));
  outputContext(fontsChanged ? 'manual' : 'repair', pr, runHead);
  setOutput('run_id', run.id);
  setOutput('run_url', run.html_url);
}

function validateVisibleReport(report) {
  if (report?.schemaVersion !== 1 || !['ok', 'missing'].includes(report.status) ||
      !Array.isArray(report.visible) || report.visible.length > 50000 ||
      !Array.isArray(report.missing) || report.missing.length > 5000) {
    throw new Error('Visible font report has an unsupported or incomplete schema.');
  }
  const visible = new Map();
  for (const item of report.visible) {
    const codePoint = parseCodePoint(item.codePoint);
    if (item.character !== String.fromCodePoint(codePoint) || !Array.isArray(item.files) || item.files.length > 1000) {
      throw new Error(`Invalid visible glyph record for ${item.codePoint}.`);
    }
    if (visible.has(codePoint)) throw new Error(`Duplicate visible glyph record for ${item.codePoint}.`);
    const files = [...new Set(item.files)];
    if (files.some((file) => typeof file !== 'string' || file.length > 300 || file.startsWith('/') ||
      !/^[A-Za-z0-9._/-]+\.html$/.test(file) || file.split('/').some((part) => !part || part === '.' || part === '..'))) {
      throw new Error(`Invalid rendered page path for ${item.codePoint}.`);
    }
    visible.set(codePoint, { codePoint: item.codePoint, character: item.character, files });
  }
  const reportedMissing = new Set(report.missing.map((item) => {
    const codePoint = parseCodePoint(item.codePoint);
    const current = visible.get(codePoint);
    if (!current || item.character !== current.character || JSON.stringify([...new Set(item.files)].sort()) !== JSON.stringify([...current.files].sort())) {
      throw new Error(`Visible missing-glyph report does not match the visible codepoint list: ${item.codePoint}.`);
    }
    return codePoint;
  }));
  return { visible, reportedMissing };
}

async function readCoverage(ref) {
  const result = await request(`/repos/${owner}/${repository}/contents/scripts/noto-sans-tc-site.coverage.txt?ref=${encodeURIComponent(ref)}`);
  if (result.encoding !== 'base64' || typeof result.content !== 'string' || result.size > 1024 * 1024) {
    throw new Error('PR coverage file is not a valid, bounded base64 text file.');
  }
  const encoded = result.content.replace(/\s/g, '');
  if (!Number.isSafeInteger(result.size) || result.size < 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new Error('PR coverage file has invalid size or base64 encoding.');
  }
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.length !== result.size || bytes.length > 1024 * 1024 || bytes.toString('base64') !== encoded) {
    throw new Error('PR coverage file failed its size or base64 check.');
  }
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const characters = [...text].filter((character) => character !== '\n' && character !== '\r');
  if (characters.some((character) => !tracked(character.codePointAt(0)))) {
    throw new Error("PR coverage file contains code points outside the site's tracked ranges.");
  }
  return { text, codepoints: new Set(characters.map((character) => character.codePointAt(0))) };
}

async function prepare() {
  const directory = process.env.FONT_FIX_REPORT_DIRECTORY;
  const baseRef = process.env.FONT_FIX_PR_BASE_REF;
  if (!['dev', 'main'].includes(baseRef)) {
    throw new Error('Font repair only supports PRs targeting dev or main.');
  }
  const needsCmapReport = baseRef === 'main';
  const reportNames = needsCmapReport ? [visibleReportName, cmapReportName] : [visibleReportName];
  for (const name of reportNames) {
    if (fs.statSync(path.join(directory, name)).size > 10 * 1024 * 1024) throw new Error('Font report exceeds the 10 MB size limit.');
  }
  const visibleReport = JSON.parse(fs.readFileSync(path.join(directory, visibleReportName), 'utf8'));
  const cmapReport = needsCmapReport
    ? JSON.parse(fs.readFileSync(path.join(directory, cmapReportName), 'utf8'))
    : null;
  if (visibleReport.status === 'error' || cmapReport?.status === 'error') {
    throw new Error('A font checker reported an error rather than a repairable missing code point.');
  }
  if (cmapReport && (cmapReport.schemaVersion !== 1 || !['ok', 'missing'].includes(cmapReport.status) ||
      !Array.isArray(cmapReport.missing) || cmapReport.missing.length > 5000)) {
    throw new Error('WOFF2 cmap report has an unsupported or incomplete schema.');
  }
  const { visible, reportedMissing } = validateVisibleReport(visibleReport);
  const pr = await request(`/repos/${owner}/${repository}/pulls/${process.env.FONT_FIX_PR_NUMBER}`);
  if (pr.state !== 'open' || pr.head.sha !== process.env.FONT_FIX_HEAD_SHA ||
      pr.head.repo?.full_name !== repo || pr.base.ref !== baseRef) {
    throw new Error('Source PR head changed before the report was processed.');
  }
  const coverage = await readCoverage(pr.head.sha);
  if (cmapReport && (cmapReport.coverageCount !== coverage.codepoints.size ||
      cmapReport.weightAxis?.min !== 100 || cmapReport.weightAxis?.max !== 900)) {
    throw new Error('WOFF2 cmap report does not match coverage size or variable-font axis requirements.');
  }
  const visibleMissing = new Set([...visible.keys()].filter((codePoint) => !coverage.codepoints.has(codePoint)));
  if (visibleReport.status !== (visibleMissing.size ? 'missing' : 'ok') ||
      visibleMissing.size !== reportedMissing.size || [...visibleMissing].some((codePoint) => !reportedMissing.has(codePoint))) {
    throw new Error('Visible font report does not match the source PR coverage file.');
  }
  const cmapMissing = new Set(cmapReport?.missing.map(parseCodePoint) ?? []);
  if (cmapReport && (cmapReport.status !== (cmapMissing.size ? 'missing' : 'ok') ||
      [...cmapMissing].some((codePoint) => !coverage.codepoints.has(codePoint)))) {
    throw new Error('WOFF2 cmap report does not match the source PR coverage file.');
  }
  const missing = new Set([...visibleMissing, ...cmapMissing]);
  if (!missing.size || missing.size > 5000) throw new Error('No repairable missing glyphs, or the report exceeds the 5,000 glyph limit.');

  const additions = [...missing].sort((a, b) => a - b);
  const details = additions.map((codePoint) => visible.get(codePoint) ?? {
    codePoint: formatCodePoint(codePoint), character: String.fromCodePoint(codePoint), files: [],
  });
  const temp = process.env.RUNNER_TEMP;
  fs.writeFileSync(path.join(temp, 'font-fix-coverage.txt'), coverage.text);
  fs.writeFileSync(path.join(temp, 'font-fix-codepoints.json'), JSON.stringify(additions.map(formatCodePoint)));
  fs.writeFileSync(path.join(temp, 'font-fix-missing.json'), JSON.stringify(details, null, 2));
  setOutput('prepared', 'true');
  setOutput('missing_count', additions.length);
}

const compareFiles = async (baseSha, headSha, token) => {
  const comparison = await request(`/repos/${owner}/${repository}/compare/${baseSha}...${headSha}`, { token });
  const actual = (comparison.files ?? []).map((file) => file.filename).sort();
  if (!actual.length || actual.some((file) => !fontPaths.includes(file))) {
    throw new Error('Repair branch may change only the WOFF2 font and coverage manifest.');
  }
};

const blobSha = (data) => {
  const header = Buffer.from(`blob ${data.length}\0`);
  return createHash('sha1').update(header).update(data).digest('hex');
};

async function createRepair() {
  const token = process.env.FONT_FIX_APP_TOKEN;
  const prNumber = Number(process.env.FONT_FIX_PR_NUMBER);
  const sourceSha = process.env.FONT_FIX_HEAD_SHA;
  const baseRef = process.env.FONT_FIX_HEAD_REF;
  const branch = `bot/font-fix/pr-${prNumber}-${sourceSha.slice(0, 12)}`;
  const outputDirectory = path.join(process.env.RUNNER_TEMP, 'font-fix-output');
  let createdRef = false;
  let createdPr = false;
  const outputs = new Map([
    [fontPaths[0], fs.readFileSync(path.join(outputDirectory, fontPaths[0]))],
    [fontPaths[1], fs.readFileSync(path.join(outputDirectory, fontPaths[1]))],
  ]);
  const expectedBlobs = new Map([...outputs].map(([file, contents]) => [file, blobSha(contents)]));
  const currentPr = await request(`/repos/${owner}/${repository}/pulls/${prNumber}`, { token });
  if (currentPr.state !== 'open' || currentPr.head.sha !== sourceSha || currentPr.head.ref !== baseRef) {
    setOutput('result', 'stale');
    return;
  }

  const existing = await request(
    `/repos/${owner}/${repository}/pulls?state=all&head=${encodeURIComponent(`${owner}:${branch}`)}&base=${encodeURIComponent(baseRef)}`,
    { token },
  );
  const sameBranchPr = existing.find((item) => item.head.ref === branch && item.base.ref === baseRef);
  if (sameBranchPr?.state === 'closed') {
    setOutput('result', 'closed');
    setOutput('repair_url', sameBranchPr.html_url);
    return;
  }

  const ref = await request(`/repos/${owner}/${repository}/git/ref/heads/${encodeURIComponent(branch)}`, { token, allow404: true });
  let commitSha;
  if (ref) {
    commitSha = ref.object.sha;
    const commit = await request(`/repos/${owner}/${repository}/git/commits/${commitSha}`, { token });
    if (commit.parents?.[0]?.sha !== sourceSha) throw new Error('Existing repair branch does not have the current PR head as its parent.');
    const tree = await request(`/repos/${owner}/${repository}/git/trees/${commit.tree.sha}?recursive=1`, { token });
    for (const [file, sha] of expectedBlobs) {
      if (tree.tree?.find((entry) => entry.path === file)?.sha !== sha) throw new Error('Existing repair branch has different generated font files.');
    }
  } else {
    const source = await request(`/repos/${owner}/${repository}/git/commits/${sourceSha}`, { token });
    const treeItems = [];
    for (const [file, contents] of outputs) {
      const blob = await request(`/repos/${owner}/${repository}/git/blobs`, {
        method: 'POST', token, body: { content: contents.toString('base64'), encoding: 'base64' },
      });
      if (blob.sha !== expectedBlobs.get(file)) throw new Error(`GitHub returned an unexpected blob for ${file}.`);
      treeItems.push({ path: file, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const tree = await request(`/repos/${owner}/${repository}/git/trees`, {
      method: 'POST', token, body: { base_tree: source.tree.sha, tree: treeItems },
    });
    const commit = await request(`/repos/${owner}/${repository}/git/commits`, {
      method: 'POST', token,
      body: {
        message: `fix(fonts): add Noto Sans TC glyphs for #${prNumber}`,
        tree: tree.sha,
        parents: [sourceSha],
      },
    });
    const latestPr = await request(`/repos/${owner}/${repository}/pulls/${prNumber}`, { token });
    if (latestPr.state !== 'open' || latestPr.head.sha !== sourceSha) {
      setOutput('result', 'stale');
      return;
    }
    await request(`/repos/${owner}/${repository}/git/refs`, {
      method: 'POST', token, body: { ref: `refs/heads/${branch}`, sha: commit.sha },
    });
    createdRef = true;
    commitSha = commit.sha;
  }

  await compareFiles(sourceSha, commitSha, token);
  const latestPr = await request(`/repos/${owner}/${repository}/pulls/${prNumber}`, { token });
  if (latestPr.state !== 'open' || latestPr.head.sha !== sourceSha) {
    if (createdRef) {
      await request(`/repos/${owner}/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'DELETE', token });
    }
    setOutput('result', 'stale');
    return;
  }
  let repairPr = sameBranchPr;
  if (!repairPr) {
    repairPr = await request(`/repos/${owner}/${repository}/pulls`, {
      method: 'POST', token,
      body: {
        title: `fix(fonts): add Noto Sans TC glyphs for #${prNumber}`,
        head: branch,
        base: baseRef,
        body: [
          `Adds the missing Noto Sans TC glyphs detected by #${prNumber}.`,
          '',
          'This PR changes only the site WOFF2 subset and its coverage manifest.',
          'It does not merge or modify the source PR automatically.',
        ].join('\n'),
      },
    });
    createdPr = true;
  }
  if (repairPr.head?.sha !== commitSha || repairPr.base?.ref !== baseRef) {
    throw new Error('Created repair PR does not point to the validated font commit and source branch.');
  }
  const finalSourcePr = await request(`/repos/${owner}/${repository}/pulls/${prNumber}`, { token });
  if (finalSourcePr.state !== 'open' || finalSourcePr.head.sha !== sourceSha) {
    if (createdPr) {
      await request(`/repos/${owner}/${repository}/pulls/${repairPr.number}`, {
        method: 'PATCH', token, body: { state: 'closed' },
      });
      await request(`/repos/${owner}/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'DELETE', token });
    } else if (createdRef) {
      await request(`/repos/${owner}/${repository}/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'DELETE', token });
    }
    setOutput('result', 'stale');
    return;
  }
  setOutput('result', sameBranchPr ? 'existing' : 'created');
  setOutput('repair_url', repairPr.html_url);
}

async function updateComment() {
  const token = process.env.FONT_FIX_APP_TOKEN;
  const prNumber = Number(process.env.FONT_FIX_PR_NUMBER);
  const marker = `<!-- font-subset-auto-fix:${prNumber} -->`;
  const routeStatus = process.env.FONT_FIX_ROUTE_STATUS;
  const runUrl = process.env.FONT_FIX_RUN_URL ?? '';
  const artifactUrl = process.env.FONT_FIX_ARTIFACT_URL ?? '';
  const repairUrl = process.env.FONT_FIX_REPAIR_URL ?? '';
  const result = process.env.FONT_FIX_RESULT ?? '';
  const error = (process.env.FONT_FIX_ERROR ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\\`*_{}\[\]<>()#+=|!]/g, '')
    .slice(0, 500);
  let body;

  if (routeStatus === 'manual') {
    body = `${marker}\n自動缺字修正已停止：來源 PR 已修改 Noto 字型或 coverage 檔，請人工確認這些變更與目前字型 cmap。\n\n[PR validation 執行紀錄](${runUrl})`;
  } else if (result === 'stale') {
    return;
  } else if (result === 'closed') {
    body = `${marker}\n相同來源 head SHA 的缺字修正 PR 曾被關閉，為尊重該決定，不會自動重開。請直接人工修正，或在來源分支新增 commit 後讓檢查重跑。\n\n[已關閉的修正 PR](${repairUrl})`;
  } else if (repairUrl) {
    const missingPath = path.join(process.env.RUNNER_TEMP, 'font-fix-missing.json');
    const missing = JSON.parse(fs.readFileSync(missingPath, 'utf8'));
    const shown = missing.slice(0, 50).map((item) => {
      const pages = item.files.length
        ? ` — ${item.files.slice(0, 3).join(', ')}${item.files.length > 3 ? ` (+${item.files.length - 3} more)` : ''}`
        : '';
      return `- \`${item.codePoint}\` ${item.character}${pages}`;
    });
    const remainder = missing.length > shown.length ? `\n- 另有 ${missing.length - shown.length} 個碼點，請見修正 PR。` : '';
    const verb = result === 'existing' ? '已有' : '已建立';
    body = `${marker}\n${verb}缺字修正 PR：${repairUrl}\n\n${shown.join('\n')}${remainder}\n\n修正 PR 只更新字型檔；合併後會重跑來源 PR 檢查，來源 PR 仍需另行 Review 與合併。`;
  } else {
    const fallback = artifactUrl ? `\n\n[下載產生的字型修正 artifact](${artifactUrl})` : '';
    const detail = error ? `\n\n原因：${error}` : '';
    body = `${marker}\n偵測到字型檢查失敗，但沒有建立修正 PR。請檢視 [workflow 執行紀錄](${runUrl})；若有成功產生的檔案，可使用下方 artifact。${detail}${fallback}`;
  }

  const comments = await listPages(`/repos/${owner}/${repository}/issues/${prNumber}/comments`, token);
  const matches = comments.filter((comment) => comment.user?.type === 'Bot' && comment.body?.includes(marker));
  if (matches.length) {
    await request(`/repos/${owner}/${repository}/issues/comments/${matches[0].id}`, {
      method: 'PATCH', token, body: { body },
    });
    for (const duplicate of matches.slice(1)) {
      await request(`/repos/${owner}/${repository}/issues/comments/${duplicate.id}`, { method: 'DELETE', token });
    }
  } else {
    await request(`/repos/${owner}/${repository}/issues/${prNumber}/comments`, { method: 'POST', token, body: { body } });
  }
}

async function main() {
  const command = process.argv[2];
  try {
    if (!owner || !repository) throw new Error('GITHUB_REPOSITORY must be owner/repository.');
    if (command === 'classify') await classify();
    else if (command === 'prepare') await prepare();
    else if (command === 'create') await createRepair();
    else if (command === 'comment') await updateComment();
    else throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    setOutput('error', error instanceof Error ? error.message.slice(0, 1000) : 'Unexpected error.');
    throw error;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
