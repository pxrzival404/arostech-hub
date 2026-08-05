import { test, expect } from '@playwright/test'

test.describe('Hub Routing E2E Smoke Tests', () => {

  const pages = [
    { path: '/', heading: 'Solusi Energi & Infrastruktur Terpercaya untuk Indonesia' },
    { path: '/about', heading: 'Membangun Masa Depan Energi Berkelanjutan' },
    { path: '/contact', heading: 'Pusat Kontak & Kemitraan' },
    { path: '/products', heading: 'Katalog Produk & Solusi Infrastruktur' },
    { path: '/certifications', heading: 'Sertifikasi' },
    { path: '/faq', heading: 'Pertanyaan yang Sering Diajukan' },
    { path: '/portfolio', heading: 'Portofolio Proyek Kami' },
    { path: '/articles', heading: 'Artikel & Berita' },
  ]

  for (const { path, heading } of pages) {
    test(`Should load ${path} successfully`, async ({ page }) => {
      // Increase timeout for slow compilation in dev server
      test.setTimeout(90000)
      
      const response = await page.goto(`http://127.0.0.1:3000${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      })
      expect(response).not.toBeNull()
      expect(response!.status()).not.toBe(404)
      
      // Verify no unexpected redirects
      await expect(page).toHaveURL(`http://127.0.0.1:3000${path}`)

      // Verify the page title or main heading element exists
      const headingLocator = page.locator('h1')
      await expect(headingLocator).toBeVisible({ timeout: 20000 })
      await expect(headingLocator).toContainText(heading)

      // Verify Navbar is visible (rendered inside a header tag)
      await expect(page.locator('header')).toBeVisible()
    })
  }

  test('Negative test: Nonexistent page returns 404', async ({ page }) => {
    test.setTimeout(60000)
    const response = await page.goto('http://127.0.0.1:3000/nonexistent-page-xyz', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    })
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(404)
  })
})
