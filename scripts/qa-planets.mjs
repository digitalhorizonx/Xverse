const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.BASE_URL ?? "http://localhost:3100";
const MAP = [
  ["Xability", "/showcase/xability"],
  ["XSites", "/showcase/xsite"],
  ["XApps", "/showcase/xapps"],
  ["XAI", "/showcase/ai"],
  ["XAuto", "/showcase/xauto"],
];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--enable-webgl"] });
let ok = 0;
for (const [name, expected] of MAP) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("xverse:entered", "1"); } catch {} });
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4500); // scene settles
  // find the planet's floating name label
  const label = page.locator(`div.pointer-events-none:text-is("${name}")`).first();
  let clicked = false;
  for (let attempt = 0; attempt < 6 && !clicked; attempt++) {
    const box = await label.boundingBox().catch(() => null);
    if (!box) { await page.waitForTimeout(800); continue; }
    // planet emblem sits above the label
    await page.mouse.click(box.x + box.width / 2, box.y - 30);
    try {
      await page.waitForURL(`**${expected}`, { timeout: 9000 });
      clicked = true;
    } catch { /* planet drifted; retry */ }
  }
  const url = page.url();
  const good = url.includes(expected);
  ok += good ? 1 : 0;
  console.log(`${good ? "✓" : "✗"} planet ${name} → ${url.replace(base, "") || "(no nav)"} (expected ${expected})`);
  await ctx.close();
}
console.log(`planet mapping: ${ok}/${MAP.length}`);
await browser.close();
process.exit(ok === MAP.length ? 0 : 1);
