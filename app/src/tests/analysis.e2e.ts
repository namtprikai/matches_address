import test, { type ElectronApplication, _electron as electron } from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication

test.beforeAll(async () => {
    // find the latest build in the out directory
    const latestBuild = findLatestBuild()
    // parse the packaged Electron app and find paths and other info
    const appInfo = parseElectronApp(latestBuild)
    electronApp = await electron.launch({
        executablePath: appInfo.executable // path to the Electron executable
    })
})

test.afterAll(async () => {
    await electronApp.close()
})

test('ワークブック一覧へ移動', async () => {
    const page = await electronApp.firstWindow()
    const title = await page.title()
    expect(title).toBe('空き家プロジェクト')
    expect(page).not.toBeNull()
})