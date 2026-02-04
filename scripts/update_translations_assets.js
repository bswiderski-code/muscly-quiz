const fs = require('fs');
const path = require('path');

const DIRECTORY = path.join(process.cwd(), 'i18n', 'translations');

const replacements = [
    { from: 'sample_guy.svg', to: 'sample-guy.svg' },
    { from: 'answers_summary.svg', to: 'answers-summary.svg' },
    { from: 'create_plan_btn.svg', to: 'create-plan-btn.svg' },
    { from: 'lets_go.svg', to: 'lets-go-btn.svg' },
    { from: 'get_your.svg', to: 'get-yours-btn.svg' },
    { from: 'want_bulk_f.svg', to: 'bulking-btn-f.svg' },
    { from: 'want_cut_f.svg', to: 'cutting-btn-f.svg' },
    { from: 'want_bulk.svg', to: 'bulking-btn.svg' },
    { from: 'want_cut.svg', to: 'cutting-btn.svg' }
];

function updateTranslations() {
    if (!fs.existsSync(DIRECTORY)) {
        console.error('Directory not found:', DIRECTORY);
        return;
    }

    const files = fs.readdirSync(DIRECTORY).filter(file => file.endsWith('.json'));

    files.forEach(file => {
        const filePath = path.join(DIRECTORY, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            let modified = false;

            replacements.forEach(({ from, to }) => {
                // Use regex with 'g' flag to replace all occurrences
                const regex = new RegExp(from, 'g');
                if (regex.test(newContent)) {
                    newContent = newContent.replace(regex, to);
                    modified = true;
                    console.log(`[${file}] Replaced ${from} -> ${to}`);
                }
            });

            if (modified) {
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated ${file}`);
            } else {
                console.log(`No changes needed for ${file}`);
            }
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    });
}

updateTranslations();
