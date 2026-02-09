
import { prisma } from '../lib/prisma';
import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import { getLocaleFromCountry } from '../lib/i18n/localeUtils';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

async function main() {
    console.log('--- Order PDF Token Generator ---');

    try {
        const orderIdInput = await question('Enter Order ID: ');
        const orderId = parseInt(orderIdInput.trim(), 10);

        if (isNaN(orderId)) {
            console.error('Invalid Order ID.');
            process.exit(1);
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user_data: true }
        });

        if (!order) {
            console.error(`Order #${orderId} not found.`);
            process.exit(1);
        }

        console.log(`\nCurrent Order Details:`);
        console.log(`ID: ${order.id}`);
        console.log(`User: ${order.user_data?.email || 'N/A'}`);
        console.log(`Country: ${order.country}`);
        console.log(`Current Token: ${order.pdfToken || 'None'}`);
        console.log(`Item: ${order.item}`);

        const newCountry = await question(`Enter new Country Code (leave empty to keep '${order.country}'): `);
        const finalCountry = newCountry.trim().toUpperCase() || order.country;

        const confirm = await question(`\nGenerate new token for Order #${orderId} with Country '${finalCountry}'? (y/N): `);

        if (confirm.toLowerCase() !== 'y') {
            console.log('Operation cancelled.');
            process.exit(0);
        }

        const newToken = uuidv4();

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                pdfToken: newToken,
                country: finalCountry
            }
        });

        console.log('\nSUCCESS! Order updated.');
        console.log(`New Token: ${updatedOrder.pdfToken}`);
        console.log(`Country: ${updatedOrder.country}`);

        // Calculate expected paths
        const locale = getLocaleFromCountry(finalCountry);
        const translationsPath = path.join(process.cwd(), 'i18n', 'translations', `${locale}.json`);

        let workoutBase = 'File';
        let dietBase = 'File';

        if (fs.existsSync(translationsPath)) {
            const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));
            if (translations.PdfFilenames) {
                workoutBase = translations.PdfFilenames.workout || workoutBase;
                dietBase = translations.PdfFilenames.raport || translations.PdfFilenames.diet || dietBase;
            }
        }

        const workoutPath = `training_plan/${finalCountry}/${workoutBase}_${orderId}.pdf`;
        const dietPath = `diet/${finalCountry}/${dietBase}_${orderId}.pdf`;

        console.log('\n--- Expected S3 File Paths ---');
        console.log(`Workout: ${workoutPath}`);
        console.log(`Diet/Report: ${dietPath}`);

        console.log('\n--- Generated Streaming Links ---');
        console.log(`Workout: /file/${locale}/${newToken}/workout`);
        console.log(`Diet:    /file/${locale}/${newToken}/diet`);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
