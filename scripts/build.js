#!/usr/bin/env node

/**
 * BhekOS Build Script
 * ====================
 * 
 * This script builds BhekOS for production:
 * - Minifies CSS and JavaScript
 * - Optimizes images
 * - Creates production-ready files in /dist
 * - Generates service worker
 * - Validates all files
 * 
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

// Configuration
const config = {
    srcDir: path.join(__dirname, '..'),
    distDir: path.join(__dirname, '../dist'),
    cssDir: path.join(__dirname, '../css'),
    jsDir: path.join(__dirname, '../js'),
    iconsDir: path.join(__dirname, '../icons'),
    version: '6.0.0',
    buildDate: new Date().toISOString(),
    minify: true,
    compress: true,
    validate: true
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
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

// Build statistics
const stats = {
    startTime: Date.now(),
    files: {
        total: 0,
        copied: 0,
        minified: 0,
        compressed: 0,
        errors: 0
    },
    sizes: {
        original: 0,
        minified: 0,
        compressed: 0
    }
};

/**
 * Main build function
 */
async function build() {
    log.section('BhekOS Production Build');
    log.info(`Version: ${config.version}`);
    log.info(`Build Date: ${config.buildDate}`);
    log.info(`Source: ${config.srcDir}`);
    log.info(`Destination: ${config.distDir}\n`);

    try {
        // Clean dist directory
        await cleanDist();
        
        // Create directory structure
        await createDirectories();
        
        // Copy and process HTML
        await processHtml();
        
        // Copy and process CSS
        await processCss();
        
        // Copy and process JavaScript
        await processJavaScript();
        
        // Copy icons
        await copyIcons();
        
        // Generate service worker
        await generateServiceWorker();
        
        // Generate manifest
        await generateManifest();
        
        // Validate build
        if (config.validate) {
            await validateBuild();
        }
        
        // Compress files
        if (config.compress) {
            await compressFiles();
        }
        
        // Show summary
        showSummary();
        
    } catch (error) {
        log.error(`Build failed: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

/**
 * Clean dist directory
 */
async function cleanDist() {
    log.info('Cleaning dist directory...');
    
    if (fs.existsSync(config.distDir)) {
        fs.rmSync(config.distDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(config.distDir, { recursive: true });
    log.success('Dist directory cleaned');
}

/**
 * Create directory structure
 */
async function createDirectories() {
    log.info('Creating directory structure...');
    
    const dirs = [
        'css',
        'js/core',
        'js/apps',
        'js/games',
        'js/integrations',
        'js/utils',
        'icons',
        'tests',
        'docs'
    ];
    
    dirs.forEach(dir => {
        const fullPath = path.join(config.distDir, dir);
        fs.mkdirSync(fullPath, { recursive: true });
    });
    
    log.success('Directory structure created');
}

/**
 * Process HTML files
 */
async function processHtml() {
    log.info('Processing HTML files...');
    
    const htmlFiles = [
        'index.html'
    ];
    
    htmlFiles.forEach(file => {
        const srcPath = path.join(config.srcDir, file);
        const destPath = path.join(config.distDir, file);
        
        if (fs.existsSync(srcPath)) {
            let content = fs.readFileSync(srcPath, 'utf8');
            
            // Replace development URLs with production URLs
            content = content.replace(
                /http:\/\/localhost:\d+/g,
                'https://bhekos.com'
            );
            
            // Add build timestamp
            content = content.replace(
                '</head>',
                `  <!-- Build: ${config.buildDate} | Version: ${config.version} -->\n</head>`
            );
            
            // Minify HTML (basic)
            if (config.minify) {
                content = content
                    .replace(/\s+/g, ' ')
                    .replace(/>\s+</g, '><')
                    .trim();
            }
            
            fs.writeFileSync(destPath, content);
            
            stats.files.copied++;
            stats.sizes.original += Buffer.byteLength(content, 'utf8');
        }
    });
    
    log.success(`HTML files processed (${htmlFiles.length})`);
}

/**
 * Process CSS files
 */
async function processCss() {
    log.info('Processing CSS files...');
    
    const cssFiles = fs.readdirSync(config.cssDir)
        .filter(file => file.endsWith('.css'));
    
    cssFiles.forEach(file => {
        const srcPath = path.join(config.cssDir, file);
        const destPath = path.join(config.distDir, 'css', file);
        
        let content = fs.readFileSync(srcPath, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        
        // Minify CSS
        if (config.minify) {
            content = content
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                .replace(/\s+/g, ' ')              // Collapse whitespace
                .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around symbols
                .replace(/;}/g, '}')               // Remove last semicolon
                .trim();
        }
        
        fs.writeFileSync(destPath, content);
        
        stats.files.copied++;
        stats.files.minified++;
        stats.sizes.original += originalSize;
        stats.sizes.minified += Buffer.byteLength(content, 'utf8');
    });
    
    log.success(`CSS files processed (${cssFiles.length})`);
}

/**
 * Process JavaScript files
 */
async function processJavaScript() {
    log.info('Processing JavaScript files...');
    
    const jsDirs = ['core', 'apps', 'games', 'integrations', 'utils'];
    const fileCount = { total: 0, processed: 0 };
    
    jsDirs.forEach(dir => {
        const srcDir = path.join(config.srcDir, 'js', dir);
        const destDir = path.join(config.distDir, 'js', dir);
        
        if (fs.existsSync(srcDir)) {
            const files = fs.readdirSync(srcDir)
                .filter(file => file.endsWith('.js'));
            
            files.forEach(file => {
                const srcPath = path.join(srcDir, file);
                const destPath = path.join(destDir, file);
                
                let content = fs.readFileSync(srcPath, 'utf8');
                const originalSize = Buffer.byteLength(content, 'utf8');
                
                // Minify JavaScript (basic - in production use terser)
                if (config.minify) {
                    content = content
                        .replace(/\/\/.*$/gm, '')           // Remove single line comments
                        .replace(/\/\*[\s\S]*?\*\//g, '')   // Remove multi-line comments
                        .replace(/\s+/g, ' ')                // Collapse whitespace
                        .replace(/\s*([=+\-*/{}[\]();,])\s*/g, '$1') // Remove spaces around symbols
                        .trim();
                }
                
                fs.writeFileSync(destPath, content);
                
                fileCount.total++;
                fileCount.processed++;
                stats.files.copied++;
                stats.files.minified++;
                stats.sizes.original += originalSize;
                stats.sizes.minified += Buffer.byteLength(content, 'utf8');
            });
        }
    });
    
    log.success(`JavaScript files processed (${fileCount.processed}/${fileCount.total})`);
}

/**
 * Copy icons
 */
async function copyIcons() {
    log.info('Copying icons...');
    
    if (fs.existsSync(config.iconsDir)) {
        const icons = fs.readdirSync(config.iconsDir)
            .filter(file => /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(file));
        
        icons.forEach(file => {
            const srcPath = path.join(config.iconsDir, file);
            const destPath = path.join(config.distDir, 'icons', file);
            
            fs.copyFileSync(srcPath, destPath);
            stats.files.copied++;
        });
        
        log.success(`Icons copied (${icons.length})`);
    }
}

/**
 * Generate service worker
 */
async function generateServiceWorker() {
    log.info('Generating service worker...');
    
    const swPath = path.join(config.srcDir, 'sw.js');
    const destPath = path.join(config.distDir, 'sw.js');
    
    if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf8');
        
        // Update cache name with version
        content = content.replace(
            /CACHE_NAME = ['"](.+)['"]/,
            `CACHE_NAME = 'bhekos-v${config.version.replace(/\./g, '-')}'`
        );
        
        // Add build timestamp
        content = `// Build: ${config.buildDate}\n${content}`;
        
        fs.writeFileSync(destPath, content);
        
        log.success('Service worker generated');
    } else {
        log.warn('Service worker not found');
    }
}

/**
 * Generate manifest
 */
async function generateManifest() {
    log.info('Generating manifest...');
    
    const manifestPath = path.join(config.srcDir, 'manifest.json');
    const destPath = path.join(config.distDir, 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Update version
        manifest.version = config.version;
        
        fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2));
        
        log.success('Manifest generated');
    } else {
        log.warn('Manifest not found');
    }
}

/**
 * Validate build
 */
async function validateBuild() {
    log.info('Validating build...');
    
    const requiredFiles = [
        'index.html',
        'manifest.json',
        'sw.js',
        'css/main.css',
        'css/components.css',
        'css/themes.css',
        'js/core/os.js',
        'js/apps/ai-chat.js',
        'js/apps/browser.js',
        'js/integrations/bhekthink-bridge.js',
        'js/integrations/bhekwork-bridge.js'
    ];
    
    let missing = [];
    let valid = true;
    
    requiredFiles.forEach(file => {
        const fullPath = path.join(config.distDir, file);
        if (!fs.existsSync(fullPath)) {
            missing.push(file);
            valid = false;
        }
    });
    
    if (valid) {
        log.success('Build validation passed');
    } else {
        log.warn(`Missing files: ${missing.join(', ')}`);
    }
}

/**
 * Compress files
 */
async function compressFiles() {
    log.info('Compressing files for delivery...');
    
    const compressDir = (dir) => {
        const files = getAllFiles(dir);
        
        files.forEach(file => {
            if (file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html')) {
                const content = fs.readFileSync(file);
                const gzipped = zlib.gzipSync(content);
                
                fs.writeFileSync(`${file}.gz`, gzipped);
                
                stats.files.compressed++;
                stats.sizes.compressed += gzipped.length;
            }
        });
    };
    
    compressDir(config.distDir);
    
    log.success(`Files compressed (${stats.files.compressed})`);
}

/**
 * Get all files recursively
 */
function getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath));
        } else {
            results.push(filePath);
        }
    });
    
    return results;
}

/**
 * Show build summary
 */
function showSummary() {
    const endTime = Date.now();
    const duration = ((endTime - stats.startTime) / 1000).toFixed(2);
    
    const originalMB = (stats.sizes.original / (1024 * 1024)).toFixed(2);
    const minifiedMB = (stats.sizes.minified / (1024 * 1024)).toFixed(2);
    const compressedMB = (stats.sizes.compressed / (1024 * 1024)).toFixed(2);
    const savings = ((1 - stats.sizes.minified / stats.sizes.original) * 100).toFixed(1);
    const compressionSavings = ((1 - stats.sizes.compressed / stats.sizes.original) * 100).toFixed(1);
    
    log.section('Build Summary');
    
    console.log(`${colors.bright}Duration:${colors.reset} ${duration}s`);
    console.log(`${colors.bright}Files:${colors.reset} ${stats.files.copied} copied, ${stats.files.minified} minified, ${stats.files.compressed} compressed`);
    console.log(`${colors.bright}Sizes:${colors.reset}`);
    console.log(`  Original:   ${originalMB} MB`);
    console.log(`  Minified:   ${minifiedMB} MB (${savings}% reduction)`);
    console.log(`  Compressed: ${compressedMB} MB (${compressionSavings}% reduction)`);
    console.log(`${colors.bright}Output:${colors.reset} ${config.distDir}`);
    
    log.success('Build completed successfully!');
}

// Run build
build();
