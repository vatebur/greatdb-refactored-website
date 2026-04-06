#!/usr/bin/env node

/**
 * GreatDB Website Content Extractor
 * Extracts main content from old HTML pages
 */

const fs = require('fs');
const path = require('path');

const OLD_SITE_PATH = '/root/greatdb/greatdb-website-backup/www.greatdb.com';
const OUTPUT_DIR = '/root/greatdb/refactored-website/extracted-content';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract main content from HTML
 * Removes navigation, header, footer and extracts the main content area
 */
function extractContent(html, filePath) {
    // Simple regex-based extraction
    // Look for main content area (usually between navigation and footer)

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const description = descMatch ? descMatch[1] : '';

    // Try to find main content area
    // Common patterns in the old site
    let content = '';

    // Pattern 1: Look for main content div
    const mainMatch = html.match(/<div\s+class=["']main["'][^>]*>([\s\S]*?)<div\s+class=["']footer["']/i);
    if (mainMatch) {
        content = mainMatch[1];
    } else {
        // Pattern 2: Look for content between navigation and footer
        const navFooterMatch = html.match(/<\/nav>([\s\S]*?)<footer/i);
        if (navFooterMatch) {
            content = navFooterMatch[1];
        } else {
            // Pattern 3: Get everything in body
            const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
                content = bodyMatch[1];
            }
        }
    }

    // Clean up content
    content = content
        .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove scripts
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    return {
        title,
        description,
        content,
        sourcePath: filePath
    };
}

/**
 * Process a single HTML file
 */
function processFile(filePath, relativePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        const extracted = extractContent(html, relativePath);

        // Create output path
        const outputPath = path.join(OUTPUT_DIR, relativePath.replace(/\.html$/, '.json'));
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(extracted, null, 2));
        console.log(`✓ Extracted: ${relativePath}`);

        return true;
    } catch (error) {
        console.error(`✗ Error processing ${relativePath}:`, error.message);
        return false;
    }
}

/**
 * Process directory recursively
 */
function processDirectory(dirPath, baseDir = dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let processed = 0;

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            // Skip certain directories
            if (['static', 'ueditor', 'node_modules'].includes(entry.name)) {
                continue;
            }
            processed += processDirectory(fullPath, baseDir);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            const relativePath = path.relative(baseDir, fullPath);
            if (processFile(fullPath, relativePath)) {
                processed++;
            }
        }
    }

    return processed;
}

// Main execution
console.log('GreatDB Content Extractor');
console.log('=========================\n');
console.log(`Source: ${OLD_SITE_PATH}`);
console.log(`Output: ${OUTPUT_DIR}\n`);

const startTime = Date.now();
const totalProcessed = processDirectory(OLD_SITE_PATH);
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n=========================`);
console.log(`✓ Processed ${totalProcessed} files in ${duration}s`);
console.log(`✓ Output saved to: ${OUTPUT_DIR}`);
