// Full interaction QA matrix for the Xverse V1 polish.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");

const base = process.env.BASE_URL ?? "http://localhost:3100";
let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name + (detail ? ` — ${detail}` : "")); console.log(`  ✗ ${name} ${detail}`); }
}

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-gl=angle", "--enable-webgl"],
});

async function newPage(opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 },
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
    colorScheme: opts.scheme ?? "dark",
    reducedMotion: opts.reducedMotion ?? "no-preference",
    locale: opts.locale === "ar" ? "ar-SA" : "en-US",
  });
  if (opts.locale) await ctx.addCookies([{ name: "xverse-locale", value: opts.locale, url: base }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, page, errors };
}

// ---------------------------------------------------------------- routes
console.log("\n[1] Routes render without console errors");
const routes = ["/", "/showcase", "/showcase/xability", "/showcase/xsite", "/showcase/xapps", "/showcase/xauto", "/showcase/ai", "/xability/amber-oak-coffee"];
for (const route of routes) {
  const { ctx, page, errors } = await newPage();
  const res = await page.goto(base + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  check(`GET ${route}`, res.status() === 200, `status=${res.status()}`);
  check(`${route} console clean`, errors.length === 0, errors.slice(0, 2).join(" | "));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${route} no h-overflow`, overflow <= 0, `${overflow}px`);
  await ctx.close();
}

// Alias redirects
{
  const { ctx, page } = await newPage();
  const r1 = await page.request.get(base + "/showcase/xai", { maxRedirects: 0 });
  check("alias /showcase/xai → 308 /showcase/ai", r1.status() === 308 && (r1.headers()["location"] ?? "").includes("/showcase/ai"), `status=${r1.status()}`);
  const r2 = await page.request.get(base + "/xability", { maxRedirects: 0 });
  check("/xability → 308 /showcase/xability", r2.status() === 308 && (r2.headers()["location"] ?? "").includes("/showcase/xability"), `status=${r2.status()}`);
  const res404 = await page.goto(base + "/showcase/nope", { waitUntil: "domcontentloaded" });
  check("unknown slug 404s", res404.status() === 404, `status=${res404.status()}`);
  const notFoundText = await page.textContent("main");
  check("404 page has return CTA", /Return to Universe|العودة/.test(notFoundText ?? ""));
  const resBrand404 = await page.request.get(base + "/xability/not-a-brand");
  check("unknown brand 404s", resBrand404.status() === 404, `status=${resBrand404.status()}`);
  await ctx.close();
}

// ------------------------------------------------------- language switch
console.log("\n[2] Language switcher + persistence + RTL");
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase", { waitUntil: "networkidle" });
  check("initial lang=en dir=ltr", await page.evaluate(() => document.documentElement.lang === "en" && document.documentElement.dir === "ltr"));
  await page.click('button:has-text("العربية")');
  await page.waitForFunction(() => document.documentElement.lang === "ar", null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  check("switch → lang=ar dir=rtl", await page.evaluate(() => document.documentElement.dir === "rtl"));
  const heading = await page.textContent("h2");
  check("AR content rendered", /كل منتج/.test(heading ?? ""), heading ?? "");
  const cookies = await ctx.cookies(base);
  check("locale cookie persisted", cookies.some((c) => c.name === "xverse-locale" && c.value === "ar"));
  await page.reload({ waitUntil: "networkidle" });
  check("AR survives reload", await page.evaluate(() => document.documentElement.lang === "ar"));
  await page.click('button:has-text("English")');
  await page.waitForFunction(() => document.documentElement.lang === "en", null, { timeout: 15000 });
  check("switch back → EN", true);
  await ctx.close();
}

// Accept-Language first-visit detection (browser locale ar, no cookie)
{
  const ctx = await browser.newContext({ locale: "ar-SA" });
  const page = await ctx.newPage();
  await page.goto(base + "/showcase", { waitUntil: "domcontentloaded" });
  check("Accept-Language ar → RTL first visit", await page.evaluate(() => document.documentElement.dir === "rtl"));
  await ctx.close();
}

// ---------------------------------------------------------- theme switch
console.log("\n[3] Theme switcher + persistence + system preference");
{
  const { ctx, page } = await newPage({ scheme: "dark" });
  await page.goto(base + "/showcase", { waitUntil: "networkidle" });
  check("OS dark → data-theme=dark", await page.evaluate(() => document.documentElement.dataset.theme === "dark"));
  await page.click('button[aria-label*="light" i], button[aria-label*="فاتح"]');
  await page.waitForTimeout(600);
  check("toggle → light", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check("light bg applied", bg.includes("250") || bg.includes("251"), bg);
  await page.reload({ waitUntil: "networkidle" });
  check("light survives reload", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  await ctx.close();
}
{
  const { ctx, page } = await newPage({ scheme: "light" });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  check("OS light first visit → light theme", await page.evaluate(() => document.documentElement.dataset.theme === "light"));
  const windowBg = await page.evaluate(() => {
    const el = document.querySelector(".universe-window");
    return el ? getComputedStyle(el).backgroundColor + " " + getComputedStyle(el).backgroundImage.slice(0, 30) : "missing";
  });
  check("universe window stays dark in light mode", windowBg !== "missing" && !windowBg.startsWith("rgba(0, 0, 0, 0)"), windowBg);
  await ctx.close();
}

// ------------------------------------------------------------- demos work
console.log("\n[4] Interactive demos");
{
  const { ctx, page, errors } = await newPage();
  await page.goto(base + "/showcase/xability", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const before = await page.textContent("#portal");
  await page.click('#portal button:has-text("New request")');
  await page.waitForTimeout(400);
  const after = await page.textContent("#portal");
  check("portal: submit request adds entry + burns credit", after !== before && /13 credits/.test(after ?? ""));
  await page.click('#portal button:has-text("Approve")');
  await page.waitForTimeout(300);
  check("portal: approve → publish available", (await page.locator('#portal button:has-text("Publish")').count()) > 0);
  check("xability page console clean after interaction", errors.length === 0, errors.slice(0, 2).join("|"));
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase/xsite", { waitUntil: "networkidle" });
  await page.click('button:has-text("Light mode")');
  check("xsite: theme toggle flips label", (await page.locator('button:has-text("Dark mode")').count()) > 0);
  await page.click('button:has-text("Mobile")');
  check("xsite: mobile preview toggle", (await page.locator('button:has-text("Desktop")').count()) > 0);
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase/xapps", { waitUntil: "networkidle" });
  await page.click('button:has-text("Send a push notification")');
  await page.waitForTimeout(700);
  check("xapps: push notification appears", await page.evaluate(() => /Reminder: cleaning/.test(document.body.textContent ?? "")));
  await page.click('button:has-text("Go offline")');
  check("xapps: offline banner", await page.evaluate(() => /Offline — showing cached data/.test(document.body.textContent ?? "")));
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase/xauto", { waitUntil: "networkidle" });
  await page.click('#marketplace button:has-text("Available")');
  await page.waitForTimeout(300);
  check("xauto: filter hides reserved", !(await page.textContent("#marketplace"))?.includes("Audi Q5"));
  await page.click('#marketplace button:has-text("Full service")');
  await page.click('#marketplace button:has-text("Tomorrow · 09:00")');
  check("xauto: booking completes", await page.evaluate(() => /bay 3 reserved|المنصة 3/.test(document.body.textContent ?? "")));
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase/ai", { waitUntil: "networkidle" });
  await page.click('button:has-text("Play conversation")');
  await page.waitForTimeout(2500);
  check("ai: chat plays", await page.evaluate(() => /windshield got cracked/.test(document.body.textContent ?? "")));
  await page.click('button:has-text("Run workflow")');
  await page.waitForTimeout(3800);
  check("ai: workflow completes", await page.evaluate(() => /Run again/.test(document.body.textContent ?? "")));
  await ctx.close();
}

// -------------------------------------------------------------- CTA hrefs
console.log("\n[5] CTAs + link integrity");
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase/xability", { waitUntil: "networkidle" });
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  check("Book a demo → horizonx signup", hrefs.includes("https://horizonx.site/app?auth=signup"));
  check("Talk to sales → mailto", hrefs.some((h) => h?.startsWith("mailto:digital.horizonx.tek@gmail.com")));
  check("Xability live CTA", hrefs.includes("https://xability.horizonx.site"));
  // crawl internal links
  const internal = [...new Set(hrefs.filter((h) => h?.startsWith("/") && !h.startsWith("//")))];
  for (const href of internal) {
    const res = await page.request.get(base + href.split("#")[0]);
    check(`internal link ok: ${href}`, res.status() === 200, `status=${res.status()}`);
  }
  await ctx.close();
}

// showcase index search + filter
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/showcase", { waitUntil: "networkidle" });
  await page.fill('input[type="search"]', "dental");
  await page.waitForTimeout(300);
  // Cards only (glass-strong) — the header's product switcher also links
  // to /showcase/* and must not count.
  const cards = await page.$$eval('a.glass-strong[href^="/showcase/"]', (as) => as.map((a) => a.textContent ?? ""));
  check("search 'dental' → XApps only", cards.length === 1 && cards[0].includes("XApps"), JSON.stringify(cards.map((c) => c.slice(0, 20))));
  await page.fill('input[type="search"]', "zzzz-no-match");
  await page.waitForTimeout(300);
  check("no-results state + clear", await page.evaluate(() => /No products match/.test(document.body.textContent ?? "")));
  await page.click('button:has-text("Clear search")');
  await page.waitForTimeout(300);
  check("clear restores cards", (await page.locator('a[href="/showcase/xability"]').count()) > 0);
  await page.click('button:has-text("Insurance")');
  await page.waitForTimeout(300);
  const filtered = await page.$$eval('a[href^="/showcase/"][class*="glass-strong"]', (as) => as.length);
  check("industry filter narrows products", filtered === 2, `count=${filtered}`);
  await ctx.close();
}

// ------------------------------------------------- reduced motion fallback
console.log("\n[6] Reduced motion → 2D fallback");
{
  const { ctx, page, errors } = await newPage({ reducedMotion: "reduce" });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  check("no canvas under reduced motion", (await page.locator("canvas").count()) === 0);
  check("fallback grid renders products", await page.evaluate(() => /simplified on this device/.test(document.body.textContent ?? "")));
  check("fallback console clean", errors.length === 0, errors.slice(0, 2).join("|"));
  await ctx.close();
}

// mobile hero above the fold check
console.log("\n[7] Mobile hero: CTA above fold, no overlap with 3D");
{
  const { ctx, page } = await newPage({ mobile: true });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6000);
  const cta = page.locator('a[href="/showcase"]', { hasText: /Explore|استكشف/ }).first();
  const box = await cta.boundingBox();
  check("primary CTA visible above fold (390×844)", !!box && box.y + box.height < 844, JSON.stringify(box));
  const canvasBox = await page.locator("canvas").first().boundingBox();
  check("hero copy sits above canvas, not over it", !!box && !!canvasBox && box.y + box.height <= canvasBox.y + 5, `cta=${box?.y}+${box?.height} canvas=${canvasBox?.y}`);
  await ctx.close();
}

console.log(`\n===== QA: ${pass} passed, ${fail} failed =====`);
if (failures.length) { console.log("FAILURES:"); failures.forEach((f) => console.log(" - " + f)); }
await browser.close();
process.exit(fail ? 1 : 0);
