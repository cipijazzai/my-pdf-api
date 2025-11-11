import { chromium } from "@playwright/test";

export default async function handler(req, res) {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { html, fileName = "report.pdf" } = body;

    if (!html) return res.status(400).send("Missing HTML");

    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "12mm", bottom: "14mm", left: "12mm" }
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).send(String(err));
  }
}
