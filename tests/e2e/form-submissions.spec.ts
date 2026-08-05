import { test, expect } from '@playwright/test'

test.describe('Form Submission E2E Tests', () => {

  test('1. Contact General Inquiry Form Submission Success', async ({ page }) => {
    // Intercept POST /api/contact and return success
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('http://lvh.me:3000/contact')

    // Fill form fields
    await page.locator('#gen-name').fill('Test User')
    await page.locator('#gen-email').fill('test@example.com')
    await page.locator('#gen-phone').fill('+6281234567890')
    await page.locator('#gen-subject').fill('Test Subject')
    await page.locator('#gen-message').fill('This is a test message of at least ten characters')

    // Submit
    await page.locator('button[type="submit"]:has-text("Kirim via Website")').click()

    // Verify success view
    await expect(page.locator('text=Pesan Terkirim!')).toBeVisible()
  })

  test('2. Contact General Inquiry Empty Form Validation', async ({ page }) => {
    await page.goto('http://lvh.me:3000/contact')

    // Try to submit immediately
    await page.locator('button[type="submit"]:has-text("Kirim via Website")').click()

    // Check if the input validation class is activated on invalid email blur
    await page.locator('#gen-email').fill('invalid-email')
    await page.locator('#gen-email').blur()
    
    // Check if the input border has red styling class
    const borderClass = await page.locator('#gen-email').getAttribute('class')
    expect(borderClass).toContain('border-red-300')
  })

  test('3. RFQ B2B Form Multi-step Flow Submission', async ({ page }) => {
    // Inject cart items into localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dbsn-rfq-cart',
        JSON.stringify({
          state: {
            items: [
              {
                product_id: 'sanity-id-1',
                product_name: 'Solar Module 100W',
                quantity: 2,
                variant: 'Mono',
                item_notes: 'B2B test notes',
              },
            ],
          },
          version: 0,
        })
      )
    })

    // Intercept POST /api/rfq and return 201 Created
    await page.route('**/api/rfq', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'lead-b2b-123',
            submission_status: 'received',
            dashboard_access_status: 'not_eligible',
          },
        }),
      })
    })

    await page.goto('http://lvh.me:3000/contact')

    // Switch to RFQ B2B tab
    await page.locator('button:has-text("RFQ B2B")').click()

    // Verify cart item is loaded in form (value has correct name)
    const itemHeading = page.locator('h3:has-text("Solar Module 100W")')
    await expect(itemHeading).toBeVisible()

    // Fill contact information
    await page.locator('input[name="contact_name"]').fill('B2B Buyer')
    await page.locator('input[name="contact_email"]').fill('buyer@company.com')
    await page.locator('input[name="contact_phone"]').fill('+6281234567890')
    await page.locator('input[name="company_name"]').fill('PT B2B Enterprise')
    await page.locator('textarea[name="project_scope"]').fill('Rooftop solar installation')
    await page.locator('input[name="timeline"]').fill('2026-12-31')

    // Submit RFQ
    await page.locator('button[type="submit"]:has-text("Submit RFQ")').click()

    // Verify success view
    await expect(page.locator('text=RFQ Berhasil Dikirim!')).toBeVisible()
  })

  test('4. RFQ B2G Form Multi-step Flow Submission', async ({ page }) => {
    // Inject cart items into localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'dbsn-rfq-cart',
        JSON.stringify({
          state: {
            items: [
              {
                product_id: 'sanity-pju-1',
                product_name: 'PJU Street Light',
                quantity: 5,
                variant: 'LED 60W',
                item_notes: 'B2G government standard',
              },
            ],
          },
          version: 0,
        })
      )
    })

    // Intercept POST /api/rfq and return 201 Created
    await page.route('**/api/rfq', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'lead-b2g-123',
            submission_status: 'received',
            dashboard_access_status: 'not_eligible',
          },
        }),
      })
    })

    await page.goto('http://lvh.me:3000/contact')

    // Switch to RFQ B2G tab
    await page.locator('button:has-text("RFQ B2G")').click()

    // Verify cart item is loaded in form
    const itemHeading = page.locator('h3:has-text("PJU Street Light")')
    await expect(itemHeading).toBeVisible()

    // Fill contact information
    await page.locator('input[name="contact_name"]').fill('Gov Official')
    await page.locator('input[name="contact_email"]').fill('official@gov.id')
    await page.locator('input[name="contact_phone"]').fill('+6281234567890')
    await page.locator('input[name="company_name"]').fill('Dinas Perhubungan')
    await page.locator('textarea[name="project_scope"]').fill('Public street lighting upgrade')
    await page.locator('input[name="timeline"]').fill('2026-12-31')

    // Select procurement type
    await page.locator('#procurement_type').selectOption('Tender Langsung')
    
    // Fill DIPA reference
    await page.locator('input[name="dipa_reference"]').fill('DIPA-2026-9999')

    // Submit RFQ
    await page.locator('button[type="submit"]:has-text("Submit RFQ")').click()

    // Verify success view
    await expect(page.locator('text=RFQ Berhasil Dikirim!')).toBeVisible()
  })
})
