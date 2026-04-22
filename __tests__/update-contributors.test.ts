import { describe, expect, it } from "vitest";
import {
  buildContributorsTable,
  replaceContributorsSection,
} from "../scripts/update-contributors.mjs";

describe("update contributors script", () => {
  it("builds contributors table using rows of five", () => {
    const contributors = Array.from({ length: 6 }, (_, index) => ({
      login: `user${index + 1}`,
      html_url: `https://github.com/user${index + 1}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${index + 1}?v=4`,
    }));

    const table = buildContributorsTable(contributors);

    expect(table).toContain("<table>");
    expect(table).toContain('alt="user1"');
    expect(table.match(/<tr>/g)).toHaveLength(2);
  });

  it("replaces only the contributors section between markers", () => {
    const readme = [
      "inicio",
      "<!-- ALL-CONTRIBUTORS-LIST:START -->",
      "contenido viejo",
      "<!-- ALL-CONTRIBUTORS-LIST:END -->",
      "fin",
    ].join("\n");

    const updated = replaceContributorsSection(readme, "<table>nuevo</table>");

    expect(updated).toContain("inicio");
    expect(updated).toContain("fin");
    expect(updated).toContain("<table>nuevo</table>");
    expect(updated).not.toContain("contenido viejo");
  });

  it("escapes HTML-sensitive characters from contributor data", () => {
    const table = buildContributorsTable([
      {
        login: 'user"<script>',
        html_url: "https://github.com/user?<x>",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4&x=<y>",
      },
    ]);

    expect(table).toContain("user&quot;&lt;script&gt;");
    expect(table).toContain("https://github.com/user?&lt;x&gt;");
    expect(table).toContain(
      "https://avatars.githubusercontent.com/u/1?v=4&amp;x=&lt;y&gt;",
    );
  });
});
