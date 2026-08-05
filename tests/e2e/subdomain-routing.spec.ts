import { test, expect } from '@playwright/test'

test.describe('Subdomain Routing E2E Smoke Tests', () => {

  test('1. Hub homepage renders at http://lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('hub')
    expect(headers['x-middleware-matched-route']).toBe('/(hub)')

    // Assert page content
    const heading = page.locator('h1')
    await expect(heading).toContainText('Solusi Energi & Infrastruktur Terpercaya untuk Indonesia')
    await expect(page.locator('header nav')).toContainText('DBSN')
  })

  test('2. PJU spoke page renders at http://pju.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://pju.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('pju')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/pju')

    // If Sanity has data, it might return 200, otherwise if notFound() is called it might return 404
    if (response!.status() === 200) {
      const headerText = await page.locator('header').innerText()
      expect(headerText.toLowerCase()).toContain('pju')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('3. Solar Cell spoke page renders at http://solarcell.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://solarcell.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('solarcell')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/solarcell')

    if (response!.status() === 200) {
      const headerText = await page.locator('header').innerText()
      expect(headerText.toLowerCase()).toContain('solarcell')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('4. Dashboard layout renders at http://dashboard.lvh.me:3000', async ({ page, context }) => {
    // Set the mock e2e admin token cookie to bypass authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-e2e-admin-token',
        domain: 'lvh.me',
        path: '/',
      },
    ])

    // Mock client-side session retrieval
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'System Admin',
            email: 'admin@dbsn.co.id',
            role: 'ADMIN',
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      })
    })

    const response = await page.goto('http://dashboard.lvh.me:3000')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('dashboard')
    expect(headers['x-middleware-matched-route']).toBe('/dashboard')

    // Assert layout text
    await expect(page.locator('nav')).toContainText('Dashboard')
    await expect(page.locator('h1')).toContainText('DBSN Client Dashboard')
  })

  test('5. Unknown subdomain fallthrough at http://unknown.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://unknown.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Should rewrite to /404 and return 404 status
    expect(response!.status()).toBe(404)
    
    // Assert headers: since it rewrites to /404, it should NOT have the subdomain headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBeUndefined()
  })

  test('6. API routes are not rewritten at http://lvh.me:3000/api/revalidate', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/api/revalidate')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Should return JSON response
    const contentType = response!.headers()['content-type']
    expect(contentType).toContain('application/json')

    const body = await response!.json()
    expect(body.status).toBe('ok')

    // Middleware headers should not be present (skipped rewrite)
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBeUndefined()
  })

  test('7. Alat Petir spoke page renders at http://alatpetir.lvh.me:3000', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    const response = await page.goto('http://alatpetir.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('alatpetir')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/alatpetir')

    // Accepts either 200 or 404 (in case CMS config is not seeded)
    expect([200, 404]).toContain(response!.status())
    expect(consoleErrors).toEqual([])
  })

  test('8. Baterai spoke page renders at http://baterai.lvh.me:3000', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    const response = await page.goto('http://baterai.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('baterai')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/baterai')

    expect([200, 404]).toContain(response!.status())
    expect(consoleErrors).toEqual([])
  })

  test('9. Solar Cell Spoke products page loads at http://solarcell.lvh.me:3000/products', async ({ page }) => {
    const response = await page.goto('http://solarcell.lvh.me:3000/products')
    expect(response).not.toBeNull()
    
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('solarcell')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/solarcell')

    expect([200, 404]).toContain(response!.status())
  })

  test('10. Solar Cell Spoke portfolio page loads at http://solarcell.lvh.me:3000/portfolio', async ({ page }) => {
    const response = await page.goto('http://solarcell.lvh.me:3000/portfolio')
    expect(response).not.toBeNull()
    
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('solarcell')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/solarcell')

    expect([200, 404]).toContain(response!.status())
  })
})
