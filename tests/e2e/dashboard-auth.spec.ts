import { test, expect } from '@playwright/test'

test.describe('Dashboard Authentication E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Mock CSRF token request to prevent contacting offline database
    await page.route('**/api/auth/csrf', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ csrfToken: 'mock-csrf-token' }),
      })
    })

    // Mock providers request to prevent contacting offline database
    await page.route('**/api/auth/providers', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          credentials: {
            id: 'credentials',
            name: 'Credentials',
            type: 'credentials',
            signinUrl: 'http://dashboard.lvh.me:3000/api/auth/signin/credentials',
            callbackUrl: 'http://dashboard.lvh.me:3000/dashboard',
          },
          google: {
            id: 'google',
            name: 'Google',
            type: 'oauth',
            signinUrl: 'http://dashboard.lvh.me:3000/api/auth/signin/google',
            callbackUrl: 'http://dashboard.lvh.me:3000/dashboard',
          },
        }),
      })
    })
  })

  test('1. Unauthenticated user visiting /dashboard -> redirected to /login', async ({ page }) => {
    const response = await page.goto('http://dashboard.lvh.me:3000/')
    expect(response).not.toBeNull()
    
    // Should be redirected to /login
    await expect(page).toHaveURL('http://dashboard.lvh.me:3000/login')
    
    // Verify login form heading
    await expect(page.locator('h2')).toContainText('DBSN Portal')
  })

  test('2. Google OAuth button is visible and clickable on /login', async ({ page }) => {
    await page.goto('http://dashboard.lvh.me:3000/login')
    
    const googleBtn = page.locator('button:has-text("Google")')
    await expect(googleBtn).toBeVisible()
    
    // Intercept NextAuth Google sign-in request (POST sign-in start, then GET redirect)
    await page.route('**/api/auth/signin/google*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            url: 'http://dashboard.lvh.me:3000/api/auth/signin/google',
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<div>Mock Google Sign-In Page</div>',
        })
      }
    })

    await googleBtn.click()
    
    // Verify it initiated the Google OAuth flow
    await expect(page).toHaveURL(/api\/auth\/signin\/google/)
  })

  test('3. Login with valid credentials -> redirected to /dashboard', async ({ page, context }) => {
    await page.goto('http://dashboard.lvh.me:3000/login')
    
    // Intercept credentials callback POST to set the mock token cookie and return success redirect
    await page.route('**/api/auth/callback/credentials*', async (route) => {
      if (route.request().method() === 'POST') {
        await context.addCookies([
          {
            name: 'next-auth.session-token',
            value: 'mock-e2e-admin-token',
            domain: 'lvh.me',
            path: '/',
          },
        ])
        await route.fulfill({
          status: 302,
          headers: {
            'Location': 'http://dashboard.lvh.me:3000/dashboard',
          },
        })
      } else {
        await route.fallback()
      }
    })

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

    // Fill form
    await page.locator('#email').fill('admin@dbsn.co.id')
    await page.locator('#password').fill('securepassword123')
    
    // Submit form
    await page.locator('button[type="submit"]:has-text("Masuk")').click()
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL('http://dashboard.lvh.me:3000/dashboard')
    await expect(page.locator('h1')).toContainText('DBSN Client Dashboard')
  })

  test('4. Login with invalid credentials -> shows error message', async ({ page }) => {
    await page.goto('http://dashboard.lvh.me:3000/login')
    
    // Intercept credentials callback POST to return 401 Unauthorized
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'CredentialsSignin' }),
      })
    })

    // Fill form
    await page.locator('#email').fill('wrong@dbsn.co.id')
    await page.locator('#password').fill('wrongpassword')
    
    // Submit
    await page.locator('button[type="submit"]:has-text("Masuk")').click()
    
    // Verify error message is displayed
    const errorAlert = page.locator('div:has-text("Email atau kata sandi salah")').first()
    await expect(errorAlert).toBeVisible()
  })

  test('5. /lupa-kata-sandi (forgot password) page loads correctly', async ({ page }) => {
    await page.goto('http://dashboard.lvh.me:3000/login')
    
    // Click forgot password link
    await page.locator('a:has-text("Lupa kata sandi?")').click()
    
    // Verify URL change
    await expect(page).toHaveURL('http://dashboard.lvh.me:3000/lupa-kata-sandi')
    
    // Verify page content
    await expect(page.locator('h2')).toContainText('Lupa Kata Sandi?')
  })

  test('6. Session expiry -> user is logged out and redirected', async ({ page, context }) => {
    // Start as authenticated by setting the cookie
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-e2e-admin-token',
        domain: 'lvh.me',
        path: '/',
      },
    ])

    // Mock active session initially, then empty session after clearing cookies
    let isAuthenticated = true
    await page.route('**/api/auth/session', async (route) => {
      if (isAuthenticated) {
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
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        })
      }
    })

    await page.goto('http://dashboard.lvh.me:3000/')
    await expect(page.locator('h1')).toContainText('DBSN Client Dashboard')

    // Simulate session expiry by clearing cookies and changing local auth state
    isAuthenticated = false
    await context.clearCookies()

    // Trigger page reload
    await page.reload()

    // Should redirect to /login
    await expect(page).toHaveURL('http://dashboard.lvh.me:3000/login')
  })
})
