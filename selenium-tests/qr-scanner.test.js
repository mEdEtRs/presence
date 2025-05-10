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

  // Login before tests
  await driver.get(APP_URL)
  const emailInput = await driver.findElement(By.id("email"))
  const passwordInput = await driver.findElement(By.id("password"))
  const loginButton = await driver.findElement(By.css('button[type="submit"]'))

  await emailInput.sendKeys("mohammed.ettarrass@ensaj.ma")
  await passwordInput.sendKeys("password123")
  await loginButton.click()

  // Wait for dashboard to load
  await driver.wait(until.elementLocated(By.css("h1")), 5000)
})

afterAll(async () => {
  await driver.quit()
})

describe("QR Scanner Tests", () => {
  test("Should display QR scanner tab", async () => {
    // Click on Scanner QR Code tab if not already active
    const scannerTab = await driver.findElement(By.css('[value="scanner"]'))
    await scannerTab.click()

    // Check if scanner is displayed
    const scannerTitle = await driver.findElement(By.css("h2"))
    expect(await scannerTitle.getText()).toContain("Scanner un QR Code")

    const scanButton = await driver.findElement(By.css("button"))
    expect(await scanButton.getText()).toContain("Scanner un QR code")
  })

  test("Should select a course before scanning", async () => {
    // Select a course
    const courseSelect = await driver.findElement(By.css("#course-select"))
    await courseSelect.click()

    // Wait for dropdown to appear
    const courseOption = await driver.wait(until.elementLocated(By.css('[data-value="DEVOPS"]')), 5000)
    await courseOption.click()

    // Verify course is selected
    const courseInfo = await driver.findElement(By.css(".space-y-2"))
    expect(await courseInfo.getText()).toContain("DevOps")
  })

  test("Should start scanning when button is clicked", async () => {
    const scanButton = await driver.findElement(By.css("button:not([disabled])"))
    await scanButton.click()

    // Verify scanning state
    const scanningMessage = await driver.wait(until.elementLocated(By.css(".text-muted-foreground")), 5000)
    expect(await scanningMessage.getText()).toContain("Positionnez le QR code dans le cadre")

    // Cancel scanning
    const cancelButton = await driver.findElement(By.css("button"))
    await cancelButton.click()
  })
})
