-- CreateTable
CREATE TABLE "training_plans" (
    "id" SERIAL NOT NULL,
    "sid" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "activity" TEXT,
    "bmi" DOUBLE PRECISION,
    "tdee" INTEGER,
    "bodyfat" TEXT,
    "diet_goal" TEXT,
    "frequency" INTEGER,
    "experience" TEXT,
    "location" TEXT,
    "priority" TEXT,
    "equipment" TEXT,
    "sleep" TEXT,
    "fitness_level" INTEGER,
    "difficulty" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "duration" INTEGER,
    "pushups" TEXT,
    "pullups" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymenturl" TEXT,

    CONSTRAINT "training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "checkoutId" INTEGER NOT NULL,
    "checkoutDB" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "payment_provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT NOT NULL,
    "n8n_exec" TEXT,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_plans_sid_key" ON "training_plans"("sid");
