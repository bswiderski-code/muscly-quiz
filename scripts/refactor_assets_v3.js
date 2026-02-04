const fs = require('fs');
const path = require('path');

/**
 * Final Asset Consolidation Script
 * 
 * Goals:
 * 1. Move common SVG components to /public/components/.
 * 2. Refactor example_training and move to regional/.
 * 3. Mass rename: replace _ with - in all filenames in /public/.
 * 4. Update all paths in codebase.
 */

const baseDir = process.cwd();
const publicDir = path.join(baseDir, 'public');
const regionalDir = path.join(publicDir, 'regional');
const componentsDir = path.join(publicDir, 'components');

// Helper for recursive deletion
function deleteDirRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteDirRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(dirPath);
    }
}

// 1. Move common SVG components
function moveCommonComponents() {
    const commonFiles = [
        'btns/back-carousel.svg',
        'btns/goback.svg',
        'btns/next-carousel.svg',
        'btns/unfold.svg'
    ];

    if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
    }

    commonFiles.forEach(file => {
        const src = path.join(publicDir, file);
        const dest = path.join(componentsDir, path.basename(file));
        if (fs.existsSync(src)) {
            console.log(`[Step 1] Moving ${src} to ${dest}`);
            fs.renameSync(src, dest);
        }
    });
}

// 2. Refactor example_training
function refactorExampleTraining() {
    const etDir = path.join(publicDir, 'example_training');
    if (!fs.existsSync(etDir)) return;

    const locales = fs.readdirSync(etDir);
    locales.forEach(locale => {
        const localePath = path.join(etDir, locale);
        if (fs.lstatSync(localePath).isDirectory()) {
            // Remove kalistenika
            const kalPath = path.join(localePath, 'kalistenika');
            if (fs.existsSync(kalPath)) {
                console.log(`[Step 2] Removing ${kalPath}`);
                deleteDirRecursive(kalPath);
            }

            // Move plan/* to parent
            const planPath = path.join(localePath, 'plan');
            if (fs.existsSync(planPath)) {
                console.log(`[Step 2] Moving files from ${planPath} to ${localePath}`);
                fs.readdirSync(planPath).forEach(file => {
                    fs.renameSync(path.join(planPath, file), path.join(localePath, file));
                });
                fs.rmdirSync(planPath);
            }

            // Move locale folder to regional/locale/example_training
            const destParent = path.join(regionalDir, locale);
            const destPath = path.join(destParent, 'example_training');
            if (!fs.existsSync(destParent)) fs.mkdirSync(destParent, { recursive: true });

            console.log(`[Step 2] Moving ${localePath} to ${destPath}`);
            if (fs.existsSync(destPath)) {
                // If destination exists, move files individually
                fs.readdirSync(localePath).forEach(file => {
                    fs.renameSync(path.join(localePath, file), path.join(destPath, file));
                });
                fs.rmdirSync(localePath);
            } else {
                fs.renameSync(localePath, destPath);
            }
        }
    });

    if (fs.readdirSync(etDir).length === 0) {
        fs.rmdirSync(etDir);
    }
}

// 3. Mass rename: replace _ with - in filenames
const renamedFilesMap = new Map(); // Old path -> New path

function massRename(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });

    // Sort items to process files before directories to keep paths stable
    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            massRename(fullPath);
        } else {
            if (item.name.includes('_')) {
                const newName = item.name.replace(/_/g, '-');
                const newPath = path.join(dir, newName);
                console.log(`[Step 3] Renaming file: ${fullPath} -> ${newPath}`);
                fs.renameSync(fullPath, newPath);

                // Store relative path for codebase update
                const relOld = fullPath.replace(publicDir, '');
                const relNew = newPath.replace(publicDir, '');
                renamedFilesMap.set(relOld, relNew);
            }
        }
    }
}

// 4. Update all paths in codebase
function updateCodebase() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    function walk(dir) {
        if (dir.includes('node_modules') || dir.includes('.next') || dir.includes('.git') || dir.includes('.agent')) return;

        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                walk(fullPath);
            } else if (extensions.includes(path.extname(fullPath))) {
                if (fullPath.endsWith('refactor_assets_v3.js')) continue;

                let content = fs.readFileSync(fullPath, 'utf8');
                let original = content;

                // Update common components
                content = content.replace(/\/btns\/(back-carousel\.svg|goback\.svg|next-carousel\.svg|unfold\.svg)/g, '/components/$1');

                // Update example_training
                // /example_training/{locale}/plan/sample-{n}.png -> /regional/{locale}/example_training/sample-{n}.png
                content = content.replace(/\/example_training\/(\{locale\}|en|pl|bg|cz|ro|hu)\/plan\//g, '/regional/$1/example_training/');
                content = content.replace(/\/example_training\/(\{locale\}|en|pl|bg|cz|ro|hu)\//g, '/regional/$1/example_training/');

                // Update underscores to hyphens in paths targeting public/
                // This is tricky, we only want to target strings that look like paths
                // Matches strings like "/vectors/m_bodyfat_1.svg" or "/btns/en/create_plan_btn.svg"
                content = content.replace(/(\/)([^"'\n ]+)/g, (match, prefix, suffix) => {
                    // Check if it's a path containing underscores
                    if (suffix.includes('_')) {
                        // Only replace if it likely targets public assets (starts with /vectors, /btns, /regional, /components, /payments, etc)
                        const start = suffix.split('/')[0];
                        const assetsFolders = ['vectors', 'btns', 'regional', 'components', 'payments', 'favicon', 'bodyfat_variants'];
                        if (assetsFolders.includes(start)) {
                            return prefix + suffix.replace(/_/g, '-');
                        }
                    }
                    return match;
                });

                if (content !== original) {
                    console.log(`[Step 4] Updating paths in ${fullPath}`);
                    fs.writeFileSync(fullPath, content);
                }
            }
        }
    }
    walk(baseDir);
}

console.log('--- STARTING REFACTOR V3 ---');
moveCommonComponents();
refactorExampleTraining();
// Rename vectors/sample_guy.svg specifically as requested first
const sampleGuy = path.join(vectorsDir, 'sample_guy.svg');
if (fs.existsSync(sampleGuy)) {
    console.log(`[Step 3] Renaming ${sampleGuy} to sample-guy.svg`);
    fs.renameSync(sampleGuy, path.join(vectorsDir, 'sample-guy.svg'));
}
massRename(publicDir);
updateCodebase();
console.log('--- REFACTOR V3 COMPLETE ---');
