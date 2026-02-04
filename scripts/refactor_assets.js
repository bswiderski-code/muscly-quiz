const fs = require('fs');
const path = require('path');

const locales = ['en', 'pl', 'bg', 'cz', 'ro'];
const baseDir = process.cwd();
const publicDir = path.join(baseDir, 'public');

/**
 * Step 1: Move /public/[locale] to /public/regional/[locale]
 */
function step1MoveLocales() {
    const regionalDir = path.join(publicDir, 'regional');
    if (!fs.existsSync(regionalDir)) {
        fs.mkdirSync(regionalDir, { recursive: true });
    }

    locales.forEach(locale => {
        const src = path.join(publicDir, locale);
        const dest = path.join(regionalDir, locale);
        if (fs.existsSync(src) && fs.lstatSync(src).isDirectory()) {
            console.log(`[Step 1] Moving ${src} to ${dest}`);
            fs.renameSync(src, dest);
        }
    });
}

/**
 * Step 2: Remove all files starting with "v_" in any "vein" directory
 */
function step2ProcessVein(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (item.name === 'vein') {
                const files = fs.readdirSync(fullPath);
                files.forEach(file => {
                    if (file.startsWith('v_')) {
                        console.log(`[Step 2] Removing ${path.join(fullPath, file)}`);
                        fs.unlinkSync(path.join(fullPath, file));
                    }
                });
            } else {
                step2ProcessVein(fullPath);
            }
        }
    }
}

/**
 * Step 3: Move all files from /needle/ to the parent folder and remove empty "needle" folder
 */
function step3ProcessNeedle(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (item.name === 'needle') {
                const parentDir = dir;
                const contents = fs.readdirSync(fullPath);
                contents.forEach(contentName => {
                    const srcPath = path.join(fullPath, contentName);
                    const destPath = path.join(parentDir, contentName);
                    console.log(`[Step 3] Moving ${srcPath} to ${destPath}`);

                    if (fs.existsSync(destPath)) {
                        console.log(`[Step 3] Destination already exists: ${destPath}. Renaming to avoid conflict.`);
                        const parts = path.parse(contentName);
                        let counter = 1;
                        let newDestPath = path.join(parentDir, `${parts.name}_${counter}${parts.ext}`);
                        while (fs.existsSync(newDestPath)) {
                            counter++;
                            newDestPath = path.join(parentDir, `${parts.name}_${counter}${parts.ext}`);
                        }
                        fs.renameSync(srcPath, newDestPath);
                    } else {
                        fs.renameSync(srcPath, destPath);
                    }
                });
                console.log(`[Step 3] Removing empty folder ${fullPath}`);
                fs.rmdirSync(fullPath);
            } else {
                step3ProcessNeedle(fullPath);
            }
        }
    }
}

/**
 * Step 4: Process button renames and removals in /public/btns/[locale]
 */
const buttonRenames = {
    'atgym.svg': 'gym-training-btn.svg',
    'athome.svg': 'home-training-btn.svg',
    'backtohomepage.svg': 'back-to-home-btn.svg',
    'bundle_bef.svg': 'bundle-btn.svg',
    'bundle-bef.svg': 'bundle-btn.svg',
    'workout_bef.svg': 'workout-btn.svg',
    'workout-bef.svg': 'workout-btn.svg',
    'male.svg': 'male-btn.svg',
    'female.svg': 'female-btn.svg',
    'next.svg': 'next-btn.svg',
    'once_again.svg': 'fill-again-btn.svg'
};

const buttonsToRemove = [
    'bundle_aft.svg',
    'bundle-aft.svg',
    'workout_aft.svg',
    'workout-aft.svg'
];

function step4ProcessButtons() {
    const btnsDir = path.join(publicDir, 'btns');
    if (!fs.existsSync(btnsDir)) return;

    const items = fs.readdirSync(btnsDir);
    items.forEach(item => {
        const itemPath = path.join(btnsDir, item);
        if (fs.lstatSync(itemPath).isDirectory()) {
            const localePath = itemPath;

            buttonsToRemove.forEach(file => {
                const filePath = path.join(localePath, file);
                if (fs.existsSync(filePath)) {
                    console.log(`[Step 4] Removing ${filePath}`);
                    fs.unlinkSync(filePath);
                }
            });

            Object.entries(buttonRenames).forEach(([oldName, newName]) => {
                const oldPath = path.join(localePath, oldName);
                const newPath = path.join(localePath, newName);
                if (fs.existsSync(oldPath)) {
                    console.log(`[Step 4] Renaming ${oldPath} to ${newName}`);
                    fs.renameSync(oldPath, newPath);
                }
            });
        }
    });
}

/**
 * Step 5: Update all paths and button names in code files
 */
function step5UpdatePaths() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    function walk(dir) {
        if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git') || dir.includes('.agent')) return;

        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                walk(fullPath);
            } else if (extensions.includes(path.extname(fullPath))) {
                if (fullPath.endsWith('refactor_assets.js')) continue;

                let content = fs.readFileSync(fullPath, 'utf8');
                let original = content;

                // 1. Map top-level locale folders to regional
                // Only if the string starts with /[locale]/ or /{locale}/
                // Using a pattern that matches after a quote or at the start of the string
                const localePattern = `(${locales.join('|')}|\\{locale\\})`;
                const startRegex = new RegExp(`(?<=["'])\\/(${localePattern})\\/`, 'g');
                content = content.replace(startRegex, '/regional/$1/');

                // 2. Remove /needle/
                content = content.replace(/\/needle\//g, '/');

                // 3. Button renames in strings
                Object.entries(buttonRenames).forEach(([oldN, newN]) => {
                    const regex = new RegExp(oldN.replace('.', '\\.'), 'g');
                    content = content.replace(regex, newN);
                });

                // Cleanup any potential duplicates
                content = content.replace(/\/regional(\/regional)+/g, '/regional');

                if (content !== original) {
                    console.log(`[Step 5] Updating paths in ${fullPath}`);
                    fs.writeFileSync(fullPath, content);
                }
            }
        }
    }
    walk(baseDir);
}

// Run if called directly
if (require.main === module) {
    console.log('--- STARTING REFACTOR ---');
    step1MoveLocales();
    step2ProcessVein(publicDir);
    step3ProcessNeedle(publicDir);
    step4ProcessButtons();
    step5UpdatePaths();
    console.log('--- REFACTOR COMPLETE ---');
}

module.exports = {
    step1MoveLocales,
    step2ProcessVein,
    step3ProcessNeedle,
    step4ProcessButtons,
    step5UpdatePaths
};
