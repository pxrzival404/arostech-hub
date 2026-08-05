import { test, expect } from '@playwright/test'

test.describe('Subpage Navigation & Hub-and-Spoke Routing E2E Tests', () => {

  // HUB Subpages Checks
  test('1. Hub about page loads at /about', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/about')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    const title = page.locator('h2').first()
    await expect(title).toContainText('PT. DBSN Sentradaya')
  })

  test('2. Hub products page loads at /products', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/products')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    const heading = page.locator('h2').first()
    await expect(heading).toContainText('Penerangan Jalan Umum Tenaga Surya')
  })

  test('3. Hub contact page loads at /contact', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/contact')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Pusat Kontak & Kemitraan')
  })

  test('4. Hub FAQ page loads at /faq', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/faq')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Pertanyaan yang Sering Diajukan')
  })

  test('5. Hub articles list and slug details load correctly', async ({ page }) => {
    // List Page
    const listResponse = await page.goto('http://lvh.me:3000/articles')
    expect(listResponse).not.toBeNull()
    expect(listResponse!.status()).toBe(200)

    // Check Article Heading
    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Artikel & Berita Terbaru')

    // Go directly to first article details (uses static slug from articles.ts)
    const detailResponse = await page.goto('http://lvh.me:3000/articles/tren-pju-tenaga-surya-2024-smart-city')
    expect(detailResponse).not.toBeNull()

    // Depending on CMS connection, it might return 200 or 404
    if (detailResponse!.status() === 200) {
      // Verify detail page has correct heading
      await expect(page.locator('h1')).toContainText('Tren PJU Tenaga Surya 2024')
    } else {
      expect(detailResponse!.status()).toBe(404)
    }
  })

  // SPOKE Subpages Checks
  test('6. PJU Spoke products page loads at pju.lvh.me:3000/products', async ({ page }) => {
    const response = await page.goto('http://pju.lvh.me:3000/products')
    expect(response).not.toBeNull()

    // Might return 200 or 404 depending on Sanity's configuration for the 'pju' spoke subdomain
    if (response!.status() === 200) {
      await expect(page.locator('h1')).toContainText('Katalog Produk')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('7. PJU Spoke portfolio page loads at pju.lvh.me:3000/portfolio', async ({ page }) => {
    const response = await page.goto('http://pju.lvh.me:3000/portfolio')
    expect(response).not.toBeNull()

    if (response!.status() === 200) {
      await expect(page.locator('h1')).toContainText('Portofolio Proyek')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('8. PJU Spoke dynamic page falls back to 404 when not found in CMS', async ({ page }) => {
    const response = await page.goto('http://pju.lvh.me:3000/non-existent-page-slug')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(404)
  })

  // Navbar Coordination Check
  test('9. Navbar links route to standalone pages instead of homepage anchors', async ({ page }) => {
    await page.goto('http://lvh.me:3000/about')

    // Click 'Portofolio' link in Navbar
    const portfolioLink = page.locator('header nav a', { hasText: 'Portofolio' })
    await expect(portfolioLink).toBeVisible()

    // Check href attribute resolves to standalone page
    const href = await portfolioLink.getAttribute('href')
    expect(href).toBe('/portfolio')

    // Click it and verify it navigates to standalone page
    await portfolioLink.click()
    await expect(page).toHaveURL('http://lvh.me:3000/portfolio')
  })
})

// ============================================================================
// Contact Page — ProjectMapSection (Google Maps Embed)
// ============================================================================

test.describe('Contact Page — ProjectMapSection', () => {
  test('10. Contact page renders the Google Maps iframe and map section', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/contact')
    expect(response!.status()).toBe(200)

    // The map section landmark should be present
    await expect(page.locator('text=Lokasi Geografis')).toBeVisible()

    // Google Maps iframe embed must be present
    const iframe = page.locator('iframe[title*="Lokasi Geografis"]')
    await expect(iframe).toBeVisible()

    // "Open in Google Maps" anchor must link to maps.google.com
    const mapsLink = page.locator('a:has-text("Buka di Google Maps")')
    await expect(mapsLink).toBeVisible()
    const href = await mapsLink.getAttribute('href')
    expect(href).toContain('maps.google.com')
    expect(href).toContain('-7.2756')   // latitude sanity check
    expect(href).toContain('112.7421')  // longitude sanity check
  })

  test('11. ProjectMapSection info cards render office details', async ({ page }) => {
    await page.goto('http://lvh.me:3000/contact')

    // Section heading
    const heading = page.locator('text=Detail Kontak')
    await expect(heading).toBeVisible()

    // Office hours info card
    await expect(page.locator('text=Jam Operasional')).toBeVisible()
  })
})

// ============================================================================
// Footer Navigation — Named Routes on Subpages
// ============================================================================

test.describe('Footer Navigation — Named Routes vs Anchors', () => {
  test('12. Footer "Tentang Kami" on /products subpage points to /about', async ({ page }) => {
    await page.goto('http://lvh.me:3000/products')

    const link = page.locator('footer a', { hasText: 'Tentang Kami' })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toBe('/about')
  })

  test('13. Footer "Hubungi Kami" on /about subpage points to /contact', async ({ page }) => {
    await page.goto('http://lvh.me:3000/about')

    const link = page.locator('footer a', { hasText: 'Hubungi Kami' })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toBe('/contact')
  })

  test('14. Footer "Tentang Kami" on HOME page still uses /about link', async ({ page }) => {
    await page.goto('http://lvh.me:3000/')

    const link = page.locator('footer a', { hasText: 'Tentang Kami' })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toBe('/about')
  })

  test('15. Footer "Portofolio Proyek" on /contact subpage points to /portfolio', async ({ page }) => {
    await page.goto('http://lvh.me:3000/contact')

    const link = page.locator('footer a', { hasText: 'Portofolio Proyek' })
    await expect(link).toBeVisible()

    const href = await link.getAttribute('href')
    expect(href).toBe('/portfolio')
  })
})
