import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
test("creator edits, saves, restores, exports and reimports", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "手机创作" })).toBeVisible();
  await expect(page.locator(".home-screen")).toHaveCSS("opacity", "1");
  await page.screenshot({
    path: "outputs/v0.5/studio-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "手机设置", exact: true }).click();
  await page.getByLabel("机主名称").fill("测试机主");
  await page.getByRole("button", { name: "选择sand壁纸" }).click();
  await page.getByRole("button", { name: "保存设置", exact: true }).click();
  await expect(page.getByText("测试机主 的 iPhone")).toBeVisible();
  await page.getByRole("button", { name: "已保存到本机" }).click();
  await page.reload();
  await expect(page.getByText("测试机主 的 iPhone")).toBeVisible();
  await page.getByRole("button", { name: "批量导入聊天记录" }).click();
  await page.getByRole("button", { name: "确认导入", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("2 条");
  await page.getByRole("button", { name: "关闭提示" }).click();
  await page.getByRole("button", { name: "素材与内容", exact: true }).click();
  await page.getByRole("button", { name: "添加内容", exact: true }).click();
  await page.getByLabel("会话名称").fill("测试会话");
  await page.getByLabel("故事内容").fill("这是一条经过浏览器验证的消息");
  await page.getByRole("button", { name: "保存内容", exact: true }).click();
  await expect(page.getByText("测试会话", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "导出作品", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: /完整 ZIP 备份/ }).click();
  const file = await downloaded;
  const zip = await JSZip.loadAsync(await readFile((await file.path())!));
  const w = JSON.parse(await zip.file("work.json")!.async("string"));
  expect(w.phone.owner).toBe("测试机主");
  expect(
    w.data.messages.some((i: { body: string }) =>
      i.body.includes("浏览器验证"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.locator('input[accept=".json,.zip"]').setInputFiles({
    name: "roundtrip.zip",
    mimeType: "application/zip",
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
  });
  await expect(page.getByRole("status")).toContainText("作品已导入");
  expect(errors).toEqual([]);
});
test("preview progresses through clues and an ending without editing draft", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "预览", exact: true }).click();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  const preview = page.locator(".preview-overlay");
  await preview
    .getByRole("button", { name: "打开备忘录", exact: true })
    .click();
  await preview.getByRole("button", { name: /如果我忘记了/ }).click();
  await expect(
    preview.getByRole("heading", { name: "你会如何选择？" }),
  ).toBeVisible();
  await preview.getByRole("button", { name: "赴约 · 雨停了" }).click();
  await expect(
    page.getByRole("heading", { name: "故事在这里停泊。" }),
  ).toBeVisible();
  await page.screenshot({
    path: "outputs/v0.2/player-ending.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "退出预览" }).click();
  await expect(page.getByRole("heading", { name: "手机创作" })).toBeVisible();
});
test("static export contains player and can run from subdirectory", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "导出作品", exact: true }).click();
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: /独立玩家网页/ }).click();
  const file = await wait;
  const zip = await JSZip.loadAsync(await readFile((await file.path())!));
  expect(zip.file("index.html")).not.toBeNull();
  expect(zip.file("work.json")).not.toBeNull();
  expect(await zip.file("player.js")!.async("string")).not.toContain(
    "从一部手机开始",
  );
  await page.route("**/exported/**", async (route) => {
    const name =
      new URL(route.request().url()).pathname.split("/exported/")[1] ||
      "index.html";
    const entry = zip.file(name);
    if (!entry) return route.fulfill({ status: 404 });
    await route.fulfill({
      body: await entry.async("nodebuffer"),
      contentType: name.endsWith(".html")
        ? "text/html"
        : name.endsWith(".js")
          ? "application/javascript"
          : name.endsWith(".css")
            ? "text/css"
            : name.endsWith(".json")
              ? "application/json"
              : "text/plain",
    });
  });
  await page.goto("http://127.0.0.1:4180/exported/index.html");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await page.getByRole("button", { name: "打开备忘录", exact: true }).click();
  await page.getByRole("button", { name: /如果我忘记了/ }).click();
  await expect(
    page.getByRole("heading", { name: "你会如何选择？" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(
    page.getByRole("heading", { name: "你会如何选择？" }),
  ).toBeVisible();
});
test("mobile workspace stays within viewport and graph loads", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "手机创作" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(page.locator(".home-screen")).toHaveCSS("opacity", "1");
  await page.screenshot({
    path: "outputs/v0.2/studio-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "剧情编排", exact: true }).click();
  await expect(
    page.getByText("图结构检查通过", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "添加节点", exact: true }).click();
  await expect(page.getByLabel("名称", { exact: true })).toHaveValue(
    "新的事件",
  );
});

test("all registered app templates open and expose editable saved content", async ({
  page,
}) => {
  test.setTimeout(90000);
  const { registry } = await import("../src/registry");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  const phone = page.locator(".phone-stage .phone-shell");
  await page.getByRole("button", { name: "打开 App 库", exact: true }).click();
  for (const app of registry) {
    const b = page.getByRole("button", {
      name: `安装${app.name}`,
      exact: true,
    });
    if (await b.count()) await b.click();
  }
  await page.getByRole("button", { name: "完成", exact: true }).click();
  for (const app of registry) {
    await phone.getByRole("button", { name: "搜索", exact: true }).click();
    await phone.getByPlaceholder("App 名称").fill(app.name);
    await phone.getByRole("button", { name: app.name, exact: true }).click();
    await expect(phone.locator(".app-nav strong")).toHaveText(app.name);
    await phone.getByRole("button", { name: "新增内容", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "保存内容", exact: true }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await phone.getByRole("button", { name: "返回桌面", exact: true }).click();
  }
  expect(errors).toEqual([]);
});

test("photo upload and structured note formatting survive save and reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "素材与内容", exact: true }).click();
  await page
    .getByRole("combobox", { name: "选择内容 App" })
    .selectOption("photos");
  await page.getByRole("button", { name: "添加内容", exact: true }).click();
  await page.getByLabel("标题", { exact: true }).fill("上传的线索照片");
  await page
    .getByRole("dialog")
    .locator("input[type=file]")
    .setInputFiles({
      name: "clue.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6QZ4AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.getByRole("button", { name: "移除素材" })).toBeVisible();
  await page.getByRole("button", { name: "保存内容", exact: true }).click();
  await page
    .getByRole("combobox", { name: "选择内容 App" })
    .selectOption("notes");
  await page.getByRole("button", { name: "添加内容", exact: true }).click();
  await page.getByLabel("标题", { exact: true }).fill("加粗的约定");
  await page.locator(".tiptap").fill("请记住这个约定");
  await page.locator(".tiptap").selectText();
  await page.getByRole("button", { name: "粗体", exact: true }).click();
  await page.getByRole("button", { name: "保存内容", exact: true }).click();
  await page.getByRole("button", { name: "已保存到本机", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "素材与内容", exact: true }).click();
  await page
    .getByRole("combobox", { name: "选择内容 App" })
    .selectOption("notes");
  await page.getByRole("button", { name: "加粗的约定", exact: true }).click();
  await expect(page.locator(".tiptap strong")).toContainText("请记住这个约定");
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  await page.getByRole("button", { name: "导出作品", exact: true }).click();
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: /作品 JSON/ }).click();
  const file = await wait;
  const work = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(
    work.data.photos.find(
      (i: { title: string }) => i.title === "上传的线索照片",
    ).media,
  ).toMatch(/^data:image\/webp;base64,/);
});

test("rejects invalid work versions and unsafe ZIP paths", async ({ page }) => {
  await page.goto("/");
  const input = page.locator('input[accept=".json,.zip"]');
  await input.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ formatVersion: 999 })),
  });
  await expect(page.getByRole("status")).toContainText("formatVersion");
  await page.getByRole("button", { name: "关闭提示" }).click();
  const zip = new JSZip();
  zip.file("../work.json", "{}");
  await input.setInputFiles({
    name: "unsafe.zip",
    mimeType: "application/zip",
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
  });
  await expect(page.getByRole("status")).toContainText("不安全路径");
});
