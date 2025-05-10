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
})

afterAll(async () => {
  await driver.quit()
})

describe("Login Tests", () => {
  test("Should display login form", async () => {
    await driver.get(APP_URL)

    const loginTitle = await driver.findElement(By.css("h2")).getText()
    expect(loginTitle).toContain("Connexion")

    const emailInput = await driver.findElement(By.id("email"))
    const passwordInput = await driver.findElement(By.id("password"))
    const loginButton = await driver.findElement(By.css('button[type="submit"]'))

    expect(await emailInput.isDisplayed()).toBe(true)
    expect(await passwordInput.isDisplayed()).toBe(true)
    expect(await loginButton.isDisplayed()).toBe(true)
  })

  test("Should show error with invalid credentials", async () => {
    await driver.get(APP_URL)

    const emailInput = await driver.findElement(By.id("email"))
    const passwordInput = await driver.findElement(By.id("password"))
    const loginButton = await driver.findElement(By.css('button[type="submit"]'))

    await emailInput.sendKeys("invalid@example.com")
    await passwordInput.sendKeys("wrongpassword")
    await loginButton.click()

    // Wait for error message
    const errorMessage = await driver.wait(until.elementLocated(By.css('[role="alert"]')), 5000)

    expect(await errorMessage.isDisplayed()).toBe(true)
    expect(await errorMessage.getText()).toContain("Email ou mot de passe incorrect")
  })

  test("Should login successfully with valid credentials", async () => {
    await driver.get(APP_URL)

    const emailInput = await driver.findElement(By.id("email"))
    const passwordInput = await driver.findElement(By.id("password"))
    const loginButton = await driver.findElement(By.css('button[type="submit"]'))

    await emailInput.sendKeys("mohammed.ettarrass@ensaj.ma")
    await passwordInput.sendKeys("password123")
    await loginButton.click()

    // Wait for dashboard to load
    const dashboardTitle = await driver.wait(until.elementLocated(By.css("h1")), 5000)

    expect(await dashboardTitle.getText()).toContain("Système de Présence ENSAJ")

    // Verify user is logged in
    const userInfo = await driver.findElement(By.css(".text-muted-foreground"))
    expect(await userInfo.getText()).toContain("Mohammed Ettarrass")
  })
})
