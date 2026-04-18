import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const START_MARKER = "<!-- ALL-CONTRIBUTORS-LIST:START -->";
const END_MARKER = "<!-- ALL-CONTRIBUTORS-LIST:END -->";
const COLUMNS_PER_ROW = 5;
const MAX_PAGES = 100;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildContributorsTable(contributors) {
  if (contributors.length === 0) {
    return "<table>\n  <tbody>\n  </tbody>\n</table>";
  }

  const rows = [];

  for (let i = 0; i < contributors.length; i += COLUMNS_PER_ROW) {
    const chunk = contributors.slice(i, i + COLUMNS_PER_ROW);
    const cells = chunk
      .map((contributor) => {
        const safeHtmlUrl = escapeHtml(contributor.html_url);
        const safeAvatarUrl = escapeHtml(contributor.avatar_url);
        const safeLogin = escapeHtml(contributor.login);
        return `      <td align="center"><a href="${safeHtmlUrl}"><img src="${safeAvatarUrl}" width="80px;" alt="${safeLogin}"/><br /><sub><b>${safeLogin}</b></sub></a></td>`;
      })
      .join("\n");
    rows.push(`    <tr>\n${cells}\n    </tr>`);
  }

  return `<table>\n  <tbody>\n${rows.join("\n")}\n  </tbody>\n</table>`;
}

export function replaceContributorsSection(readmeContent, tableContent) {
  const markerRegex = new RegExp(
    `${START_MARKER}[\\s\\S]*?${END_MARKER}`,
    "m",
  );

  if (!markerRegex.test(readmeContent)) {
    throw new Error("No se encontraron los marcadores de contribuidores en README.md");
  }

  return readmeContent.replace(
    markerRegex,
    `${START_MARKER}\n${tableContent}\n${END_MARKER}`,
  );
}

async function fetchContributors() {
  const repository = process.env.GITHUB_REPOSITORY || "Open-Source-Uniandes/Aula-Finder";
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const contributors = [];
  let page = 1;

  while (true) {
    if (page > MAX_PAGES) {
      throw new Error(
        `Se alcanzó el límite de paginación (${MAX_PAGES}) al consultar contribuidores.`,
      );
    }

    const url = `https://api.github.com/repos/${repository}/contributors?per_page=100&page=${page}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Error consultando GitHub API (${response.status}): ${body}`,
      );
    }

    const pageData = await response.json();

    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    contributors.push(...pageData);
    page += 1;
  }

  return contributors.filter(
    (contributor) =>
      contributor?.html_url &&
      contributor?.avatar_url &&
      contributor?.login &&
      contributor.type !== "Bot" &&
      !contributor.login.endsWith("[bot]"),
  );
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, "..");
  const readmePath = path.join(repoRoot, "README.md");

  const contributors = await fetchContributors();
  const tableContent = buildContributorsTable(contributors);
  const currentReadme = await readFile(readmePath, "utf8");
  const updatedReadme = replaceContributorsSection(currentReadme, tableContent);

  if (currentReadme === updatedReadme) {
    console.log("README.md ya está actualizado.");
    return;
  }

  await writeFile(readmePath, updatedReadme, "utf8");
  console.log(`README.md actualizado con ${contributors.length} contribuidores.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
