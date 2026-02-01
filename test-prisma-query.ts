import { prisma } from './lib/prisma';

async function main() {
  try {
    console.log('Testing specific findMany query...');
    const result = await prisma.trainingPlan.findMany({
      take: 100,
      skip: 0,
      select: {
        id: true,
        sid: true,
        amount: true,
        description: true,
        currency: true,
        status: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        activity: true,
        bmi: true,
        tdee: true,
        bodyfat: true,
        diet_goal: true,
        frequency: true,
        experience: true,
        location: true,
        priority: true,
        equipment: true,
        sleep: true,
        fitness_level: true,
        difficulty: true,
        weight: true,
        height: true,
        paymentId: true,
        createdAt: true,
        paymenturl: true
      }
    });
    console.log('Success! Fetched', result.length, 'records.');
    if (result.length > 0) {
        console.log('First record sample:', JSON.stringify(result[0], null, 2));
    }

  } catch (err: any) {
    console.error('Prisma specific query failed!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.stack) {
        console.error('Stack trace:', err.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

