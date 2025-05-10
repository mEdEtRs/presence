const { Builder, By, until } = require("selenium-webdriver")
const chrome = require("selenium-webdriver/chrome")

let driver
const APP_URL = process.env.APP_URL || "http://localhost:3000"

beforeAll(async () => {
  const options = new chrome.Options()
  options.addArguments("--headless")
  options.addArguments("--no-sandbox")
  options.addArguments("--disable-dev-shm-usage")

  driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build()

  // Login as admin before tests
  await driver.get(APP_URL)
  const emailInput = await driver.findElement(By.id("email"))
  const passwordInput = await driver.findElement(By.id("password"))
  const loginButton = await driver.findElement(By.css('button[type="submit"]'))

  await emailInput.sendKeys("admin@ensaj.ma")
  await passwordInput.sendKeys("admin123")
  await loginButton.click()

  // Wait for dashboard to load
  await driver.wait(until.elementLocated(By.css("h1")), 5000)

  // Navigate to admin dashboard
  const adminButton = await driver.findElement(By.css("button.w-full"))
  await adminButton.click()

  // Wait for admin dashboard to load
  await driver.wait(until.elementLocated(By.css("h1")), 5000)
})

afterAll(async () => {
  await driver.quit()
})

describe("Admin Dashboard Tests", () => {
  test("Should display admin dashboard", async () => {
    const dashboardTitle = await driver.findElement(By.css("h1"))
    expect(await dashboardTitle.getText()).toContain("Tableau de bord administrateur")

    // Check if tabs are present
    const tabs = await driver.findElements(By.css('[role="tab"]'))
    expect(tabs.length).toBe(4)

    const tabTexts = await Promise.all(tabs.map((tab) => tab.getText()))
    expect(tabTexts).toContain("Générer QR Codes")
    expect(tabTexts).toContain("Statistiques")
    expect(tabTexts).toContain("Gestion des utilisateurs")
    expect(tabTexts).toContain("Présences en temps réel")
  })

  test("Should navigate between tabs", async () => {
    // Click on QR Generator tab
    const qrTab = await driver.findElement(By.css('[value="qr"]'))
    await qrTab.click()

    // Verify QR Generator content is displayed
    const qrTitle = await driver.findElement(By.css("h2"))
    expect(await qrTitle.getText()).toContain("Générateur de QR Codes")

    // Click on Statistics tab
    const statsTab = await driver.findElement(By.css('[value="stats"]'))
    await statsTab.click()

    // Verify Statistics content is displayed
    const statsTitle = await driver.findElement(By.css("h2"))
    expect(await statsTitle.getText()).toContain("Statistiques de présence")

    // Click on User Management tab
    const usersTab = await driver.findElement(By.css('[value="users"]'))
    await usersTab.click()

    // Verify User Management content is displayed
    const usersTitle = await driver.findElement(By.css("h2"))
    expect(await usersTitle.getText()).toContain("Gestion des utilisateurs")
  })

  test("Should reset attendance history", async () => {
    // Go to Attendance tab
    const attendanceTab = await driver.findElement(By.css('[value="attendance"]'))
    await attendanceTab.click()

    // Click reset button
    const resetButton = await driver.findElement(By.css("button:has(.h-4.w-4)"))
    await resetButton.click()

    // Wait for confirmation dialog
    const confirmDialog = await driver.wait(until.elementLocated(By.css('[role="dialog"]')), 5000)

    // Verify dialog content
    const dialogTitle = await confirmDialog.findElement(By.css("h2"))
    expect(await dialogTitle.getText()).toContain("Réinitialiser toutes les présences")

    // Cancel the operation
    const cancelButton = await confirmDialog.findElement(By.css("button:first-of-type"))
    await cancelButton.click()
  })
})
