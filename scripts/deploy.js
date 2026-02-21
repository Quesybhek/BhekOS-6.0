#!/usr/bin/env node

/**
 * BhekOS Deployment Script
 * ========================
 * 
 * This script deploys BhekOS to various platforms:
 * - GitHub Pages
 * - Netlify
 * - Vercel
 * - Firebase
 * - Custom server
 * 
 * Usage: node scripts/deploy.js [platform] [options]
 * Example: node scripts/deploy.js github --prod
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const config = {
    version: '6.0.0',
    buildDir: path.join(__dirname, '../dist'),
    platforms: ['github', 'netlify', 'vercel', 'firebase', 'custom'],
    defaultPlatform: 'github'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
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

// Command line arguments
const args = process.argv.slice(2);
const platform = args[0] || config.defaultPlatform;
const isProd = args.includes('--prod');
const isDryRun = args.includes('--dry-run');

/**
 * Main deploy function
 */
async function deploy() {
    log.section('BhekOS Deployment');
    log.info(`Version: ${config.version}`);
    log.info(`Platform: ${platform}`);
    log.info(`Mode: ${isProd ? 'Production' : 'Preview'}`);
    log.info(`Build Dir: ${config.buildDir}\n`);

    // Validate platform
    if (!config.platforms.includes(platform)) {
        log.error(`Invalid platform: ${platform}`);
        log.info(`Supported platforms: ${config.platforms.join(', ')}`);
        process.exit(1);
    }

    // Check if build directory exists
    if (!fs.existsSync(config.buildDir)) {
        log.warn('Build directory not found. Running build first...');
        execSync('node scripts/build.js', { stdio: 'inherit' });
    }

    // Confirm deployment
    if (!isDryRun) {
        const confirmed = await confirmDeployment();
        if (!confirmed) {
            log.info('Deployment cancelled');
            process.exit(0);
        }
    }

    // Deploy to selected platform
    switch (platform) {
        case 'github':
            await deployToGitHub();
            break;
        case 'netlify':
            await deployToNetlify();
            break;
        case 'vercel':
            await deployToVercel();
            break;
        case 'firebase':
            await deployToFirebase();
            break;
        case 'custom':
            await deployToCustom();
            break;
    }

    log.success(`Deployment to ${platform} completed!`);
}

/**
 * Confirm deployment
 */
function confirmDeployment() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${colors.yellow}Deploy to ${platform}? (y/n) ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

/**
 * Deploy to GitHub Pages
 */
async function deployToGitHub() {
    log.info('Deploying to GitHub Pages...');

    if (isDryRun) {
        log.info('[DRY RUN] Would deploy to GitHub Pages');
        return;
    }

    try {
        // Check if git is installed
        execSync('git --version', { stdio: 'ignore' });

        // Check if we're in a git repository
        if (!fs.existsSync(path.join(__dirname, '../.git'))) {
            log.warn('Not a git repository. Initializing...');
            execSync('git init', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
        }

        // Create .nojekyll file
        fs.writeFileSync(path.join(config.buildDir, '.nojekyll'), '');

        // Deploy using gh-pages or git
        if (isProd) {
            // Use gh-pages package if available
            try {
                execSync('npx gh-pages --dist dist --branch gh-pages --message "Deploy v${config.version}"', {
                    cwd: path.join(__dirname, '..'),
                    stdio: 'inherit'
                });
            } catch (error) {
                // Fallback to git commands
                execSync(`
                    git checkout --orphan gh-pages
                    git --work-tree dist add --all
                    git --work-tree dist commit -m "Deploy v${config.version}"
                    git push origin gh-pages --force
                    git checkout main
                `, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
            }
        }

        log.success('Deployed to GitHub Pages');
        log.info('URL: https://quesybhek.github.io/bhekos/');

    } catch (error) {
        log.error(`GitHub Pages deployment failed: ${error.message}`);
        throw error;
    }
}

/**
 * Deploy to Netlify
 */
async function deployToNetlify() {
    log.info('Deploying to Netlify...');

    if (isDryRun) {
        log.info('[DRY RUN] Would deploy to Netlify');
        return;
    }

    try {
        // Check if netlify-cli is installed
        try {
            execSync('netlify --version', { stdio: 'ignore' });
        } catch (error) {
            log.warn('Netlify CLI not found. Installing...');
            execSync('npm install -g netlify-cli', { stdio: 'inherit' });
        }

        // Deploy
        const cmd = isProd
            ? `netlify deploy --dir=${config.buildDir} --prod --message "Deploy v${config.version}"`
            : `netlify deploy --dir=${config.buildDir} --message "Preview v${config.version}"`;

        execSync(cmd, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });

        log.success('Deployed to Netlify');
        log.info('URL: https://bhekos.netlify.app');

    } catch (error) {
        log.error(`Netlify deployment failed: ${error.message}`);
        throw error;
    }
}

/**
 * Deploy to Vercel
 */
async function deployToVercel() {
    log.info('Deploying to Vercel...');

    if (isDryRun) {
        log.info('[DRY RUN] Would deploy to Vercel');
        return;
    }

    try {
        // Check if vercel-cli is installed
        try {
            execSync('vercel --version', { stdio: 'ignore' });
        } catch (error) {
            log.warn('Vercel CLI not found. Installing...');
            execSync('npm install -g vercel', { stdio: 'inherit' });
        }

        // Deploy
        const cmd = isProd
            ? `vercel --prod --cwd ${path.join(__dirname, '..')}`
            : `vercel --cwd ${path.join(__dirname, '..')}`;

        execSync(cmd, { stdio: 'inherit' });

        log.success('Deployed to Vercel');
        log.info('URL: https://bhekos.vercel.app');

    } catch (error) {
        log.error(`Vercel deployment failed: ${error.message}`);
        throw error;
    }
}

/**
 * Deploy to Firebase
 */
async function deployToFirebase() {
    log.info('Deploying to Firebase...');

    if (isDryRun) {
        log.info('[DRY RUN] Would deploy to Firebase');
        return;
    }

    try {
        // Check if firebase-tools is installed
        try {
            execSync('firebase --version', { stdio: 'ignore' });
        } catch (error) {
            log.warn('Firebase Tools not found. Installing...');
            execSync('npm install -g firebase-tools', { stdio: 'inherit' });
        }

        // Check if firebase.json exists
        if (!fs.existsSync(path.join(__dirname, '../firebase.json'))) {
            log.error('firebase.json not found');
            process.exit(1);
        }

        // Deploy
        execSync(`firebase deploy --only hosting`, {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });

        log.success('Deployed to Firebase');
        log.info('URL: https://bhekos.web.app');

    } catch (error) {
        log.error(`Firebase deployment failed: ${error.message}`);
        throw error;
    }
}

/**
 * Deploy to custom server
 */
async function deployToCustom() {
    log.info('Deploying to custom server...');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const getInput = (question) => new Promise((resolve) => {
        rl.question(question, resolve);
    });

    try {
        const server = await getInput(`${colors.yellow}Server address (e.g., user@example.com): ${colors.reset}`);
        const path = await getInput(`${colors.yellow}Remote path (e.g., /var/www/bhekos): ${colors.reset}`);

        if (isDryRun) {
            log.info(`[DRY RUN] Would rsync to ${server}:${path}`);
            rl.close();
            return;
        }

        // Use rsync to deploy
        execSync(`rsync -avz --delete ${config.buildDir}/ ${server}:${path}`, {
            stdio: 'inherit'
        });

        log.success(`Deployed to ${server}:${path}`);

    } catch (error) {
        log.error(`Custom deployment failed: ${error.message}`);
        throw error;
    } finally {
        rl.close();
    }
}

// Run deployment
deploy().catch(error => {
    log.error(`Deployment failed: ${error.message}`);
    process.exit(1);
});
