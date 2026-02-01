import { prisma } from './lib/prisma';

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const count = await prisma.trainingPlan.count();
    console.log('Total training plans:', count);

    const first = await prisma.trainingPlan.findFirst();
    console.log('First record:', JSON.stringify(first, null, 2));

  } catch (err) {
    console.error('Prisma test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

