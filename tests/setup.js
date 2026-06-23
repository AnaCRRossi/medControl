require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');
const database = require('../src/models/database');

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  database.reset();

  // Clear in correct order to avoid foreign key constraints
  await prisma.usageRecord.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.user.deleteMany();
});

global.prisma = prisma;
