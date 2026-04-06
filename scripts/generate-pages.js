#!/usr/bin/env node

/**
 * GreatDB Page Generator
 * Generates new pages with Tech-Brutalist design from extracted content
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = '/root/greatdb/refactored-website/components/page-template.html';
const EXTRACTED_DIR = '/root/greatdb/refactored-website/extracted-content';
const OUTPUT_DIR = '/root/greatdb/refactored-website';

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

/**
 * Generate page from extracted content
 */
function generatePage(extractedData, outputPath, basePath = '../') {
    let page = template;

    // Replace placeholders
    page = page.replace(/\{\{TITLE\}\}/g, extractedData.title || 'GreatDB');
    page = page.replace(/\{\{DESCRIPTION\}\}/g, extractedData.description || '万里数据库');
    page = page.replace(/\{\{BASE_PATH\}\}/g, basePath);
    page = page.replace(/\{\{CONTENT\}\}/g, extractedData.content || '');

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, page);
    console.log(`✓ Generated: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

/**
 * Process extracted JSON files
 */
function processExtractedFiles() {
    // Key pages to generate
    const keyPages = [
        // Products
        { json: 'product/cid/45.json', output: 'products/centralized.html', base: '../' },
        { json: 'product/cid/2.json', output: 'products/distributed.html', base: '../' },
        { json: 'product/cid/3.json', output: 'products/management.html', base: '../' },
        { json: 'product/cid/47.json', output: 'products/migration.html', base: '../' },

        // Cases
        { json: 'cases/7.html', output: 'cases/government.html', base: '../' },
        { json: 'cases/8.html', output: 'cases/finance.html', base: '../' },
        { json: 'cases/9.html', output: 'cases/telecom.html', base: '../' },
        { json: 'cases/10.html', output: 'cases/energy.html', base: '../' },

        // About
        { json: 'about/cid/44.json', output: 'about/index.html', base: '../' },
        { json: 'about/cid/37.json', output: 'about/compatibility.html', base: '../' },
        { json: 'about/cid/38.json', output: 'about/reports.html', base: '../' },
        { json: 'career.json', output: 'about/careers.html', base: '../' },
        { json: 'partner.json', output: 'about/partners.html', base: '../' },

        // Downloads
        { json: 'down.json', output: 'downloads/index.html', base: '../' },

        // Special
        { json: 'zt/mysql-57-eol.json', output: 'special/mysql-57-eol.html', base: '../' },
    ];

    let generated = 0;

    for (const page of keyPages) {
        const jsonPath = path.join(EXTRACTED_DIR, page.json);
        const outputPath = path.join(OUTPUT_DIR, page.output);

        if (fs.existsSync(jsonPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                generatePage(data, outputPath, page.base);
                generated++;
            } catch (error) {
                console.error(`✗ Error generating ${page.output}:`, error.message);
            }
        } else {
            console.warn(`⚠ Missing: ${page.json}`);
        }
    }

    return generated;
}

// Main execution
console.log('GreatDB Page Generator');
console.log('======================\n');

const startTime = Date.now();
const totalGenerated = processExtractedFiles();
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

console.log(`\n======================`);
console.log(`✓ Generated ${totalGenerated} pages in ${duration}s`);
