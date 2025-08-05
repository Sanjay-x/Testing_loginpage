const express = require('express');
const { Builder, By } = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

(async function runTest() {
  let driver;
  let server;

  try {
    const app = express();
    app.use(express.static(__dirname));
    server = app.listen(8081, () => {
      console.log("🚀 Server running on http://localhost:8081");
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    console.log("🌐 Opening login page...");
    await driver.get("http://localhost:8081/loginpage.html");

    await driver.findElement(By.id("username")).sendKeys("admin");
    await driver.findElement(By.id("password")).sendKeys("password@");
    await driver.findElement(By.xpath("//button[contains(., 'Login')]")).click();
    await driver.sleep(1000);

    const dashboardBox = await driver.findElement(By.id("dashboardBox"));
    const isVisible = await dashboardBox.isDisplayed();

    if (isVisible) {
      const text = await dashboardBox.getText();
      if (text.includes("Welcome to Dashboard")) {
        console.log("✅ Login test passed");
        process.exit(0);
      } else {
        console.error("❌ Unexpected dashboard message");
        process.exit(1);
      }
    } else {
      const errorMsg = await driver.findElement(By.id("errorMsg")).getText();
      console.error("❌ Login failed: ", errorMsg);
      process.exit(1);
    }

  } catch (err) {
    console.error("💥 Test crashed:", err.message);
    process.exit(1);
  } finally {
    if (driver) await driver.quit();
    if (server) server.close();
  }
})();
