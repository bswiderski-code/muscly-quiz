const fs = require('fs');
const path = require('path');

const REGIONAL_DIR = path.join(process.cwd(), 'public', 'regional');
const BTNS_DIR = path.join(process.cwd(), 'public', 'btns');
const REFERENCE_LOCALE = 'pl';
const OUTPUT_FILE = path.join(process.cwd(), 'locale-missing-files.md');

function getFiles(dir) {
    try {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir).filter(file => {
            const fullPath = path.join(dir, file);
            return fs.statSync(fullPath).isFile() && !file.startsWith('.');
        });
    } catch (e) {
        console.error(`Error reading directory ${dir}:`, e);
        return [];
    }
}

function getSubdirectories(dir) {
    try {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir).filter(file => {
            const fullPath = path.join(dir, file);
            return fs.statSync(fullPath).isDirectory() && !file.startsWith('.');
        });
    } catch (e) {
        console.error(`Error reading directory ${dir}:`, e);
        return [];
    }
}

function checkMissingFiles(baseDir, referenceLocale) {
    const referenceDirPath = path.join(baseDir, referenceLocale);
    const referenceFiles = getFiles(referenceDirPath);
    const allLocales = getSubdirectories(baseDir).filter(loc => loc !== referenceLocale);

    const missingData = {};

    allLocales.forEach(locale => {
        const localeDirPath = path.join(baseDir, locale);
        const localeFiles = new Set(getFiles(localeDirPath));

        const missing = referenceFiles.filter(file => !localeFiles.has(file));
        if (missing.length > 0) {
            missingData[locale] = missing;
        }
    });

    return missingData;
}

function run() {
    console.log('Starting locale verification...');

    let report = '# Locale Missing Files Report\n\nGenerated on: ' + new Date().toISOString() + '\n\n';
    report += `Reference locale: **${REFERENCE_LOCALE}**\n\n`;

    // Process regional
    report += '## Public / Regional\n\n';
    const regionalMissing = checkMissingFiles(REGIONAL_DIR, REFERENCE_LOCALE);
    if (Object.keys(regionalMissing).length === 0) {
        report += 'All regional directories are complete.\n\n';
    } else {
        for (const [locale, files] of Object.entries(regionalMissing)) {
            report += `### Locale: ${locale}\n`;
            files.forEach(file => {
                report += `- [ ] ${file}\n`;
            });
            report += '\n';
        }
    }

    // Process btns
    report += '## Public / Btns\n\n';
    const btnsMissing = checkMissingFiles(BTNS_DIR, REFERENCE_LOCALE);
    if (Object.keys(btnsMissing).length === 0) {
        report += 'All buttons directories are complete.\n\n';
    } else {
        for (const [locale, files] of Object.entries(btnsMissing)) {
            report += `### Locale: ${locale}\n`;
            files.forEach(file => {
                report += `- [ ] ${file}\n`;
            });
            report += '\n';
        }
    }

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Verification complete. Report saved to: ${OUTPUT_FILE}`);
}

run();
