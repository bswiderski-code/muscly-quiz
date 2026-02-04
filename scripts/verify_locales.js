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

function checkMissingFiles(baseDir, referenceLocale, subDir = '') {
    const referenceDirPath = path.join(baseDir, referenceLocale, subDir);
    const referenceFiles = getFiles(referenceDirPath);
    const allLocales = getSubdirectories(baseDir).filter(loc => loc !== referenceLocale);

    const missingData = {};

    allLocales.forEach(locale => {
        const localeDirPath = path.join(baseDir, locale, subDir);
        const localeFiles = new Set(getFiles(localeDirPath));

        const missing = referenceFiles.filter(file => !localeFiles.has(file));
        if (missing.length > 0) {
            missingData[locale] = missing;
        }
    });

    return missingData;
}

function checkReviews(baseDir, referenceLocale) {
    const allLocales = getSubdirectories(baseDir).filter(loc => loc !== referenceLocale);
    const missingData = {};

    allLocales.forEach(locale => {
        const rev1Path = path.join(baseDir, locale, 'reviews', 'rev1.png');
        if (!fs.existsSync(rev1Path)) {
            missingData[locale] = ['rev1.png'];
        }
    });

    return missingData;
}

function generateReportSection(title, missingData) {
    let section = `## ${title}\n\n`;
    if (Object.keys(missingData).length === 0) {
        section += 'All directories are complete.\n\n';
    } else {
        for (const [locale, files] of Object.entries(missingData)) {
            section += `### Locale: ${locale}\n`;
            files.forEach(file => {
                section += `- [ ] ${file}\n`;
            });
            section += '\n';
        }
    }
    return section;
}

function run() {
    console.log('Starting locale verification...');

    let report = '# Locale Missing Files Report\n\nGenerated on: ' + new Date().toISOString() + '\n\n';
    report += `Reference locale: **${REFERENCE_LOCALE}**\n\n`;

    // Process regional
    report += generateReportSection('Public / Regional (Root)', checkMissingFiles(REGIONAL_DIR, REFERENCE_LOCALE));
    report += generateReportSection('Public / Regional / Priorities', checkMissingFiles(REGIONAL_DIR, REFERENCE_LOCALE, 'priorities'));
    report += generateReportSection('Public / Regional / Priorities / Selected', checkMissingFiles(REGIONAL_DIR, REFERENCE_LOCALE, 'priorities/selected'));
    report += generateReportSection('Public / Regional / Priorities / Unselected', checkMissingFiles(REGIONAL_DIR, REFERENCE_LOCALE, 'priorities/unselected'));
    report += generateReportSection('Public / Regional / Reviews (Minimum Requirement: rev1.png)', checkReviews(REGIONAL_DIR, REFERENCE_LOCALE));

    // Process btns
    report += generateReportSection('Public / Btns', checkMissingFiles(BTNS_DIR, REFERENCE_LOCALE));

    fs.writeFileSync(OUTPUT_FILE, report);
    console.log(`Verification complete. Report saved to: ${OUTPUT_FILE}`);
}

run();
