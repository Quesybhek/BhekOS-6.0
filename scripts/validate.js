#!/usr/bin/env node

/**
 * BhekOS Validation Script
 * ========================
 * 
 * This script validates BhekOS files:
 * - Checks for required files
 * - Validates HTML, CSS, JavaScript syntax
 * - Checks for broken links
 * - Validates manifest.json
 * - Checks integration bridges
 * 
 * Usage: node scripts/validate.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
    rootDir: path.join(__dirname, '..'),
    checkHtml: true,
    checkCss: true,
    checkJs: true,
    checkLinks: true,
    checkManifest: true,
    checkIntegrations: true,
    autoFix: process.argv.includes('--fix')
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Logger
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}\n`)
};

// Validation results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    fixed: 0,
    errors: []
};

// Required files
const requiredFiles = [
    'index.html',
    'manifest.json',
    'sw.js',
    'css/main.css',
    'css/components.css',
    'css/games.css',
    'css/themes.css',
    'js/core/os.js',
    'js/core/window-manager.js',
    'js/core/security.js',
    'js/core/app-manager.js',
    'js/apps/file-explorer.js',
    'js/apps/terminal.js',
    'js/apps/browser.js',
    'js/apps/media-player.js',
    'js/apps/settings.js',
    'js/apps/games.js',
    'js/apps/ai-chat.js',
    'js/apps/notepad.js',
    'js/apps/calculator.js',
    'js/apps/paint.js',
    'js/apps/app-store.js',
    'js/apps/integration-settings.js',
    'js/games/snake.js',
    'js/games/flappy-bird.js',
    'js/games/memory.js',
    'js/games/game-2048.js',
    'js/games/puzzle.js',
    'js/games/tic-tac-toe.js',
    'js/integrations/bhekthink-bridge.js',
    'js/integrations/bhekwork-bridge.js',
    'js/utils/storage.js',
    'js/utils/notifications.js',
    'js/utils/helpers.js',
    'js/utils/animations.js',
    'js/utils/drag-drop.js',
    'icons/icon-192.png',
    'icons/bhekthink-icon.png',
    'icons/bhekwork-icon.png'
];

/**
 * Main validation function
 */
async function validate() {
    log.section('BhekOS Validation');
    log.info(`Auto-fix: ${config.autoFix ? 'Enabled' : 'Disabled'}\n`);

    // Check required files
    await checkRequiredFiles();

    // Validate HTML
    if (config.checkHtml) {
        await validateHtml();
    }

    // Validate CSS
    if (config.checkCss) {
        await validateCss();
    }

    // Validate JavaScript
    if (config.checkJs) {
        await validateJavaScript();
    }

    // Validate manifest
    if (config.checkManifest) {
        await validateManifest();
    }

    // Validate integrations
    if (config.checkIntegrations) {
        await validateIntegrations();
    }

    // Check for broken links
    if (config.checkLinks) {
        await checkLinks();
    }

    // Show summary
    showSummary();
}

/**
 * Check required files
 */
async function checkRequiredFiles() {
    log.info('Checking required files...');

    requiredFiles.forEach(file => {
        const filePath = path.join(config.rootDir, file);
        
        if (fs.existsSync(filePath)) {
            results.passed++;
        } else {
            results.failed++;
            results.errors.push(`Missing required file: ${file}`);
        }
    });

    log.success(`Required files check complete (${requiredFiles.length} files)`);
}

/**
 * Validate HTML files
 */
async function validateHtml() {
    log.info('Validating HTML files...');

    const htmlFiles = [
        'index.html',
        'tests/integration-test.html'
    ];

    htmlFiles.forEach(file => {
        const filePath = path.join(config.rootDir, file);
        
        if (!fs.existsSync(filePath)) {
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        let issues = 0;

        // Check for unclosed tags
        const tagCount = (content.match(/<[^/][^>]*>/g) || []).length;
        const closeCount = (content.match(/<\/[^>]+>/g) || []).length;
        
        if (tagCount !== closeCount) {
            issues++;
            results.warnings++;
            log.warn(`${file}: Possible unclosed tags (${tagCount} open, ${closeCount} closed)`);
        }

        // Check for missing doctype
        if (!content.toLowerCase().includes('<!doctype html>')) {
            issues++;
            results.warnings++;
            log.warn(`${file}: Missing DOCTYPE declaration`);
        }

        // Check for missing charset
        if (!content.includes('charset=')) {
            issues++;
            results.warnings++;
            log.warn(`${file}: Missing charset declaration`);
        }

        if (issues === 0) {
            results.passed++;
        }
    });

    log.success(`HTML validation complete (${htmlFiles.length} files)`);
}

/**
 * Validate CSS files
 */
async function validateCss() {
    log.info('Validating CSS files...');

    const cssFiles = [
        'css/main.css',
        'css/components.css',
        'css/games.css',
        'css/themes.css'
    ];

    cssFiles.forEach(file => {
        const filePath = path.join(config.rootDir, file);
        
        if (!fs.existsSync(filePath)) {
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        let issues = 0;

        // Check for unclosed braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            issues++;
            results.warnings++;
            log.warn(`${file}: Unclosed braces (${openBraces} open, ${closeBraces} closed)`);
        }

        // Auto-fix missing semicolons
        if (config.autoFix) {
            const fixed = content.replace(/([a-zA-Z0-9-]+)\s*:\s*([^;}\s][^;}]*)(?=[;}])/g, '$1: $2;');
            if (fixed !== content) {
                fs.writeFileSync(filePath, fixed);
                results.fixed++;
            }
        }

        if (issues === 0) {
            results.passed++;
        }
    });

    log.success(`CSS validation complete (${cssFiles.length} files)`);
}

/**
 * Validate JavaScript files
 */
async function validateJavaScript() {
    log.info('Validating JavaScript files...');

    // Use ESLint if available
    try {
        execSync('npx eslint js/ --ext .js', {
            cwd: config.rootDir,
            stdio: 'pipe'
        });
        results.passed++;
    } catch (error) {
        results.warnings++;
        log.warn('ESLint found issues. Run `npx eslint js/ --fix` to auto-fix');
    }

    log.success('JavaScript validation complete');
}

/**
 * Validate manifest.json
 */
async function validateManifest() {
    log.info('Validating manifest.json...');

    const manifestPath = path.join(config.rootDir, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
        results.errors.push('manifest.json not found');
        return;
    }

    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        let issues = 0;

        // Check required fields
        const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
        required.forEach(field => {
            if (!manifest[field]) {
                issues++;
                results.warnings++;
                log.warn(`manifest.json: Missing required field "${field}"`);
            }
        });

        // Check icons
        if (manifest.icons) {
            manifest.icons.forEach((icon, index) => {
                const iconPath = path.join(config.rootDir, icon.src);
                if (!fs.existsSync(iconPath)) {
                    issues++;
                    results.warnings++;
                    log.warn(`manifest.json: Icon not found: ${icon.src}`);
                }
            });
        }

        if (issues === 0) {
            results.passed++;
        }

    } catch (error) {
        results.errors.push(`manifest.json: Invalid JSON - ${error.message}`);
    }

    log.success('Manifest validation complete');
}

/**
 * Validate integrations
 */
async function validateIntegrations() {
    log.info('Validating integrations...');

    const integrations = [
        'js/integrations/bhekthink-bridge.js',
        'js/integrations/bhekwork-bridge.js'
    ];

    integrations.forEach(file => {
        const filePath = path.join(config.rootDir, file);
        
        if (!fs.existsSync(filePath)) {
            results.errors.push(`Integration missing: ${file}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Check for required functions
        const required = ['init', 'connect', 'processMessage', 'getStatus'];
        required.forEach(func => {
            if (!content.includes(func)) {
                results.warnings++;
                log.warn(`${file}: Missing function "${func}"`);
            }
        });

        // Check URLs
        const urlMatch = content.match(/appUrl:\s*['"]([^'"]+)['"]/);
        if (urlMatch) {
            const url = urlMatch[1];
            if (!url.includes('quesybhek.github.io')) {
                results.warnings++;
                log.warn(`${file}: Non-standard URL: ${url}`);
            }
        }

        results.passed++;
    });

    log.success('Integrations validation complete');
}

/**
 * Check for broken links
 */
async function checkLinks() {
    log.info('Checking for broken links...');

    const htmlFiles = getAllHtmlFiles(config.rootDir);
    let brokenLinks = [];

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const links = content.match(/(?:href|src)=["']([^"']+)["']/g) || [];

        links.forEach(link => {
            const url = link.match(/["']([^"']+)["']/)[1];
            
            // Skip external links and anchors
            if (url.startsWith('http') || url.startsWith('#')) {
                return;
            }

            const fullPath = path.join(path.dirname(file), url);
            
            if (!fs.existsSync(fullPath)) {
                brokenLinks.push(`${path.relative(config.rootDir, file)} -> ${url}`);
            }
        });
    });

    if (brokenLinks.length > 0) {
        results.warnings += brokenLinks.length;
        brokenLinks.forEach(link => {
            log.warn(`Broken link: ${link}`);
        });
    } else {
        results.passed++;
    }

    log.success('Link check complete');
}

/**
 * Get all HTML files recursively
 */
function getAllHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            results = results.concat(getAllHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    });
    
    return results;
}

/**
 * Show validation summary
 */
function showSummary() {
    log.section('Validation Summary');
    
    console.log(`${colors.bright}Passed:${colors.reset} ${colors.green}${results.passed}${colors.reset}`);
    console.log(`${colors.bright}Warnings:${colors.reset} ${colors.yellow}${results.warnings}${colors.reset}`);
    console.log(`${colors.bright}Failed:${colors.reset} ${colors.red}${results.failed}${colors.reset}`);
    console.log(`${colors.bright}Fixed:${colors.reset} ${colors.green}${results.fixed}${colors.reset}`);

    if (results.errors.length > 0) {
        console.log(`\n${colors.red}Errors:${colors.reset}`);
        results.errors.forEach(error => {
            console.log(`  • ${error}`);
        });
    }

    const exitCode = results.failed > 0 ? 1 : 0;
    
    if (exitCode === 0) {
        log.success('Validation passed!');
    } else {
        log.error('Validation failed!');
    }

    process.exit(exitCode);
}

// Run validation
validate();
