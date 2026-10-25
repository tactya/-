import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { Work } from "../src/schema";
async function snapshot(page: Page): Promise<Work> {
  await page.getByRole("button", { name: "导出作品", exact: true }).click();
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name: /作品 JSON/ }).click();
  const file = await wait;
  const w = JSON.parse(await readFile((await file.path())!, "utf8"));
  await page.getByRole("button", { name: "关闭", exact: true }).click();
  return w;
}
async function library(page: Page) {
  await page.getByRole("button", { name: "打开 App 库", exact: true }).click();
}
test("library distinguishes home removal, uninstall and reinstall after reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("捡手机 · FoundPhone Studio");
  expect(
    (await (await page.request.get("/manifest.webmanifest")).json()).short_name,
  ).toBe("捡手机");
  await library(page);
  await expect(page.getByText("6 个已安装 · 拖动手柄排序")).toBeVisible();
  await page.getByLabel("App 分类").selectOption("中国");
  await page.getByLabel("搜索 App", { exact: true }).fill("微信");
  await page.getByRole("button", { name: "安装微信", exact: true }).click();
  await page
    .getByRole("button", { name: "从桌面移除微信", exact: true })
    .click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  const phone = page.locator(".phone-stage .phone-shell");
  await expect(
    phone.getByRole("button", { name: "打开微信", exact: true }),
  ).toHaveCount(0);
  await phone.getByRole("button", { name: "搜索", exact: true }).click();
  await phone.getByPlaceholder("App 名称").fill("微信");
  await phone.getByRole("button", { name: "微信", exact: true }).click();
  await expect(phone.locator(".wx-nav strong")).toHaveText("微信");
  await phone.getByRole("button", { name: "返回桌面" }).click();
  await page.getByRole("button", { name: "已保存到本机", exact: true }).click();
  await page.reload();
  let w = await snapshot(page);
  expect(w.apps.find((a) => a.id === "wechat")).toMatchObject({
    installed: true,
    visible: false,
  });
  await library(page);
  await page.getByLabel("搜索 App", { exact: true }).fill("微信");
  await page.getByRole("button", { name: "卸载微信", exact: true }).click();
  await page.getByRole("button", { name: "确认卸载并保留数据" }).click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  w = await snapshot(page);
  expect(w.apps.find((a) => a.id === "wechat")?.installed).toBe(false);
  expect(w.data.wechat).toHaveLength(3);
  await library(page);
  await page.getByLabel("搜索 App", { exact: true }).fill("微信");
  await page.getByRole("button", { name: "安装微信", exact: true }).click();
  await expect(page.getByText("3 条创作内容")).toBeVisible();
  await page.getByRole("button", { name: "卸载微信", exact: true }).click();
  await page.getByLabel("保留创作数据，重新安装后恢复").uncheck();
  await page.getByRole("button", { name: "确认卸载并删除数据" }).click();
  await page.getByRole("button", { name: "安装微信", exact: true }).click();
  await expect(page.getByText("0 条创作内容")).toBeVisible();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  w = await snapshot(page);
  expect(w.data.wechat).toEqual([]);
});
test("folders, custom names, icons and drag order persist and export", async ({
  page,
}) => {
  await page.goto("/");
  await library(page);
  await page.getByRole("button", { name: "安装微信", exact: true }).click();
  await page.getByLabel("自定义 App 名称", { exact: true }).fill("旅人消息");
  await page.getByLabel("自定义图标文字").fill("旅");
  await page.getByLabel("安装筛选").selectOption("已安装");
  const grip = page.getByRole("button", { name: "拖动旅人消息排序" }),
    target = page.locator('.app-library [data-app-id="phone"]');
  await grip.dragTo(target);
  await page.getByRole("button", { name: "创建文件夹", exact: true }).click();
  await page.getByRole("textbox", { name: "文件夹名称" }).fill("通讯");
  await page.getByRole("checkbox", { name: "旅人消息", exact: true }).check();
  await page.getByRole("checkbox", { name: "信息", exact: true }).check();
  await page.getByRole("button", { name: "保存文件夹" }).click();
  await page.screenshot({
    path: "outputs/v0.5/app-library.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await expect(
    page
      .locator(".phone-shell")
      .getByRole("button", { name: "通讯", exact: true }),
  ).toBeVisible();
  let w = await snapshot(page);
  expect(w.apps[0].id).toBe("wechat");
  expect(w.apps.find((a) => a.id === "wechat")).toMatchObject({
    name: "旅人消息",
    icon: "旅",
    folder: "通讯",
    installed: true,
    visible: true,
    dock: false,
  });
  await page.getByRole("button", { name: "已保存到本机" }).click();
  await page.reload();
  w = await snapshot(page);
  expect(w.apps[0].id).toBe("wechat");
  expect(w.apps.find((a) => a.id === "wechat")?.folder).toBe("通讯");
});
test("WeChat, WhatsApp and Instagram have distinct navigation and content interactions", async ({
  page,
}) => {
  await page.goto("/");
  await library(page);
  for (const name of ["微信", "WhatsApp", "Instagram"])
    await page
      .getByRole("button", { name: `安装${name}`, exact: true })
      .click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  const phone = page.locator(".phone-stage .phone-shell");
  await phone.getByRole("button", { name: "打开微信", exact: true }).click();
  await phone.getByRole("button", { name: "通讯录", exact: true }).click();
  await expect(phone.locator(".wx-contact")).not.toHaveCount(0);
  await phone.getByRole("button", { name: "发现", exact: true }).click();
  await phone.getByRole("button", { name: /朋友圈/ }).click();
  await expect(phone.locator(".wx-moments")).toBeVisible();
  await page.screenshot({ path: "outputs/v0.5/wechat.png", fullPage: true });
  await phone.getByRole("button", { name: "返回桌面" }).click();
  await phone
    .getByRole("button", { name: "打开WhatsApp", exact: true })
    .click();
  await expect(phone.locator(".wa-filters")).toBeVisible();
  await phone.getByRole("button", { name: "通话", exact: true }).click();
  await expect(phone.locator(".wa-large-title")).toHaveText("通话");
  await phone.getByRole("button", { name: "聊天", exact: true }).click();
  await phone.locator(".wa-chat-row").first().click();
  await expect(phone.locator(".wa-thread-profile")).toBeVisible();
  await expect(phone.locator(".app-screen")).toHaveCSS("opacity", "1");
  expect(
    await phone.locator(".phone-screen").evaluate((el) => el.scrollTop),
  ).toBe(0);
  await page.screenshot({ path: "outputs/v0.5/whatsapp.png", fullPage: true });
  await phone.getByRole("button", { name: "返回桌面" }).click();
  await phone
    .getByRole("button", { name: "打开Instagram", exact: true })
    .click();
  await expect(phone.locator(".ig-stories")).toBeVisible();
  await phone
    .getByRole("button", { name: "Instagram 搜索", exact: true })
    .click();
  await expect(phone.locator(".ig-explore")).toBeVisible();
  await phone
    .getByRole("button", { name: "Instagram 个人主页", exact: true })
    .click();
  await expect(phone.locator(".ig-profile")).toBeVisible();
  await expect(phone.locator(".app-screen")).toHaveCSS("opacity", "1");
  expect(
    await phone.locator(".phone-screen").evaluate((el) => el.scrollTop),
  ).toBe(0);
  await page.screenshot({ path: "outputs/v0.5/instagram.png", fullPage: true });
  await phone
    .getByRole("button", { name: "Instagram 私信", exact: true })
    .click();
  await expect(phone.getByText("暂无私信")).toBeVisible();
});

test("player respects hidden installed apps and uninstall state without changing the draft", async ({
  page,
}) => {
  await page.goto("/");
  await library(page);
  await page.getByRole("button", { name: "安装微信", exact: true }).click();
  await page
    .getByRole("button", { name: "从桌面移除微信", exact: true })
    .click();
  await page.getByRole("button", { name: "完成", exact: true }).click();
  const before = await snapshot(page);
  await page.getByRole("button", { name: "预览", exact: true }).click();
  const preview = page.locator(".preview-overlay");
  await preview.getByRole("button", { name: "轻触解锁" }).click();
  await expect(
    preview.getByRole("button", { name: "打开微信", exact: true }),
  ).toHaveCount(0);
  await preview.getByRole("button", { name: "搜索", exact: true }).click();
  await preview.getByPlaceholder("App 名称").fill("Instagram");
  await expect(preview.locator(".search-result")).toHaveCount(0);
  await preview.getByPlaceholder("App 名称").fill("微信");
  await preview.getByRole("button", { name: "微信", exact: true }).click();
  await expect(preview.locator(".wx-nav strong")).toHaveText("微信");
  await page.getByRole("button", { name: "退出预览" }).click();
  expect((await snapshot(page)).apps).toEqual(before.apps);
  await page.locator('input[accept=".json,.zip"]').setInputFiles({
    name: "installed.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(before)),
  });
  await expect(page.getByRole("status")).toContainText("作品已导入");
  const restored = await snapshot(page);
  expect(restored.apps).toEqual(before.apps);
});

test("new works start empty with six apps and the lock keypad unlocks them", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "新建作品", exact: true }).click();
  await page.getByRole("button", { name: "手机设置", exact: true }).click();
  await page.getByLabel("锁屏密码", { exact: true }).fill("1234");
  await page.getByRole("button", { name: "保存设置", exact: true }).click();
  const w = await snapshot(page);
  expect(w.title).toBe("未命名作品");
  expect(w.apps.filter((a) => a.installed)).toHaveLength(6);
  expect(w.nodes).toEqual([]);
  expect(Object.values(w.data).flat()).toEqual([]);
  await page.getByRole("button", { name: "预览", exact: true }).click();
  const preview = page.locator(".preview-overlay");
  await preview.getByRole("button", { name: "轻触解锁" }).click();
  for (const key of ["1", "2", "3", "4"])
    await preview
      .getByRole("button", { name: `密码键${key}`, exact: true })
      .click();

  await expect(
    preview.getByRole("button", { name: "打开备忘录", exact: true }),
  ).toBeVisible();
});
