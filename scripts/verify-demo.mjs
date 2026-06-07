import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const chromePath = process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = process.env.DEMO_URL ?? "http://127.0.0.1:5173/";

async function clickFirstQuickRequest(page) {
  const quickButtons = page.locator(".quick-chip");
  const quickCount = await quickButtons.count();
  if (quickCount < 1) {
    throw new Error("No quick request chips found.");
  }
  await quickButtons.first().click();
}

async function submitFacilityRequest(page) {
  await page.getByPlaceholder("比如：帮我安排一个数学试听").fill("A校区302教室投影又坏了，今晚七点还有课");

  const sendButton = page.locator(".composer button");
  const sendCount = await sendButton.count();
  if (sendCount !== 1) {
    throw new Error(`Expected one send button, found ${sendCount}.`);
  }
  await sendButton.click();
}

async function exercise(page) {
  await page.goto(url, { waitUntil: "networkidle" });
  await clickFirstQuickRequest(page);
  await page.waitForTimeout(900);
  await submitFacilityRequest(page);
  await page.waitForTimeout(900);

  const text = await page.locator("body").innerText();
  return {
    hasMiniProgram: text.includes("智协小程序"),
    hasTrialIntent: text.includes("安排试听"),
    hasFacilityIntent: text.includes("教室/设备保障"),
    hasFacilityOwner: text.includes("郑琦"),
    hasOfficialNotice: text.includes("公众号提醒：新的对接任务"),
    hasAgentTrace: text.includes("意图识别 Agent")
  };
}

await mkdir("screenshots", { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1
});
const desktopChecks = await exercise(desktop);
await desktop.screenshot({
  path: "screenshots/desktop-after-routing.png",
  fullPage: false
});

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  deviceScaleFactor: 1
});
const mobileChecks = await exercise(mobile);
await mobile.screenshot({
  path: "screenshots/mobile-after-routing.png",
  fullPage: false
});

await browser.close();

const checks = { desktopChecks, mobileChecks };
const failed = Object.entries(checks).flatMap(([viewport, result]) =>
  Object.entries(result)
    .filter(([, passed]) => !passed)
    .map(([name]) => `${viewport}.${name}`)
);

if (failed.length > 0) {
  console.error(JSON.stringify({ checks, failed }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ checks, screenshots: ["screenshots/desktop-after-routing.png", "screenshots/mobile-after-routing.png"] }, null, 2));
