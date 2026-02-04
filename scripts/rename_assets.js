const fs = require('fs');
const path = require('path');

const renameMap = {
    'answers_summary': 'answers-summary',
    'create_plan_btn': 'create-plan-btn',
    'lets_go': 'lets-go-btn',
    'get_your': 'get-yours-btn',
    'want_bulk_f': 'bulking-btn-f',
    'want_cut_f': 'cutting-btn-f',
    'want_bulk': 'bulking-btn',
    'want_cut': 'cutting-btn',
    'sample_guy': 'sample-guy'
};

const searchDirs = [
    path.join(process.cwd(), 'public', 'regional'),
    path.join(process.cwd(), 'public', 'btns')
];

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function runRename() {
    searchDirs.forEach(dir => {
        if (!fs.existsSync(dir)) return;

        walk(dir, (filePath) => {
            const fileName = path.basename(filePath);
            const ext = path.extname(fileName);
            const base = path.basename(fileName, ext);

            if (renameMap[base]) {
                const newBase = renameMap[base];
                const newFileName = newBase + ext;
                const newFilePath = path.join(path.dirname(filePath), newFileName);

                console.log(`Renaming: ${filePath} -> ${newFilePath}`);
                fs.renameSync(filePath, newFilePath);
            }
        });
    });
}

runRename();
console.log('Renaming complete.');
