import fs from 'fs'
import path from 'path'
import { ALL_STEPS } from '../lib/steps/stepIds'
import { STEP_SLUGS } from '../lib/steps/stepSlugs'
import { funnelDefinitions } from '../lib/funnels/funnelDefinitions'
import { routing } from '../i18n/routing'
import { locales } from '../i18n/config'

const ROOT = path.resolve(__dirname, '..')

function check() {
  let errors = 0
  let warnings = 0

  console.log('🔍 Validating funnels configuration...')

  // ==========================================
  // 1. Check Step Slugs & Components
  // ==========================================
  console.log('\nChecking step slugs and components...')
  for (const step of ALL_STEPS) {
    // Check slug definition
    if (!STEP_SLUGS[step]) {
      console.error(`❌ Missing slug for step: ${step}`)
      errors++
    }

    // Check Slide component existence
    const slidePath = path.join(ROOT, 'app', 'funnel-slides', step, 'Slide.tsx')
    if (!fs.existsSync(slidePath)) {
      console.error(`❌ Missing Slide.tsx for step: ${step} at ${slidePath}`)
      errors++
    }
  }

  // ==========================================
  // 2. Check Funnel Definitions & Integrity
  // ==========================================
  console.log('\nChecking funnel definitions...')
  
  // Track used slugs per locale to ensure uniqueness
  const usedSlugs: Record<string, Set<string>> = {}
  for (const locale of locales) {
    usedSlugs[locale] = new Set()
  }

  // Get reserved paths from routing (excluding dynamic ones like /[funnel])
  // routing.pathnames keys are the internal paths.
  // We need to check if a funnel slug conflicts with a static path.
  const reservedPaths = Object.keys(routing.pathnames).filter(p => !p.includes('[') && p !== '/')

  for (const [key, def] of Object.entries(funnelDefinitions)) {
    console.log(`Validating funnel: ${key}`)
    
    // 2a. Check Steps in Order
    for (const step of def.steps.order) {
      // @ts-ignore
      if (!ALL_STEPS.includes(step)) {
        console.error(`❌ Funnel ${key} uses unknown step: ${step}`)
        errors++
      }
    }

    // 2b. Check Result Handler
    const specificResultPath = path.join(ROOT, 'app', '[locale]', 'wynik', key)
    const dynamicResultPath = path.join(ROOT, 'app', '[locale]', 'wynik', '[funnel]')
    
    if (fs.existsSync(specificResultPath)) {
        console.log(`  ✅ Result handler found for ${key} (specific folder)`)
    } else if (fs.existsSync(dynamicResultPath)) {
        console.log(`  ℹ️  Result handler for ${key} handled by dynamic [funnel] route`)
    } else {
        console.error(`❌ No result handler found for funnel: ${key}`)
        errors++
    }

    // 2c. Check Translation Completeness & Uniqueness
    for (const locale of locales) {
      const slug = def.slug[locale]
      
      if (!slug) {
        console.error(`❌ Funnel ${key} missing slug for locale: ${locale}`)
        errors++
        continue
      }

      // Check uniqueness
      if (usedSlugs[locale].has(slug)) {
        console.error(`❌ Duplicate slug '${slug}' for locale '${locale}' in funnel ${key}`)
        errors++
      }
      usedSlugs[locale].add(slug)

      // Check conflict with reserved paths
      // If we have a path '/plan', and a funnel slug 'plan', it might be ambiguous depending on routing order.
      // Usually static routes take precedence, so the funnel would be unreachable.
      const potentialPath = `/${slug}`
      if (reservedPaths.includes(potentialPath)) {
        // Check if a specific page exists for this funnel key
        // We assume the folder name matches the funnel key
        const specificFunnelPage = path.join(ROOT, 'app', '[locale]', '(funnels)', key, 'page.tsx')
        if (fs.existsSync(specificFunnelPage)) {
             // console.log(`  ℹ️  Funnel ${key} slug '${slug}' matches reserved path, but specific page exists. OK.`)
        } else {
             console.warn(`⚠️  Warning: Funnel ${key} slug '${slug}' (${locale}) conflicts with reserved path '${potentialPath}' and no specific page found at ${specificFunnelPage}. Funnel might be unreachable via dynamic route.`)
             warnings++
        }
      }
    }
  }

  // ==========================================
  // 3. Check Metadata & SEO Structure
  // ==========================================
  console.log('\nChecking metadata & SEO structure...')
  
  // Check if the main dynamic funnel page exists
  const funnelPagePath = path.join(ROOT, 'app', '[locale]', '(funnels)', '[funnel]', 'page.tsx')
  if (!fs.existsSync(funnelPagePath)) {
    console.error(`❌ Missing dynamic funnel page at ${funnelPagePath}`)
    errors++
  } else {
    console.log(`  ✅ Dynamic funnel page found`)
  }

  // Check if the main dynamic result page exists
  const resultPagePath = path.join(ROOT, 'app', '[locale]', 'wynik', '[funnel]', '[sessionId]', 'page.tsx')
  if (!fs.existsSync(resultPagePath)) {
    console.error(`❌ Missing dynamic result page at ${resultPagePath}`)
    errors++
  } else {
    console.log(`  ✅ Dynamic result page found`)
  }

  // Check if sitemap generation might be missing funnels (heuristic)
  // We can't easily check the sitemap.ts logic dynamically, but we can check if the file exists
  const sitemapPath = path.join(ROOT, 'app', 'sitemap.ts')
  if (fs.existsSync(sitemapPath)) {
     console.log(`  ✅ sitemap.ts found (Manual verification recommended to ensure it includes funnels)`)
  } else {
     console.warn(`⚠️  sitemap.ts not found. SEO might be impacted.`)
     warnings++
  }

  // ==========================================
  // Summary
  // ==========================================
  console.log('\nSummary:')
  if (errors === 0) {
    console.log('✅ All checks passed!')
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warnings found.`)
    }
  } else {
    console.error(`❌ Found ${errors} errors and ${warnings} warnings.`)
    process.exit(1)
  }
}

check()
