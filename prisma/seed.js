require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // =========================
  // USER ADMIN
  // =========================
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@email.com' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@email.com',
        password: await bcrypt.hash('123456', 10),
        role: 'ADMIN',
      },
    });
  }

  // =========================
  // USER NORMAL
  // =========================
  let user = await prisma.user.findFirst({
    where: { email: 'user@email.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'user@email.com',
        password: await bcrypt.hash('123456', 10),
        role: 'USER',
      },
    });
  }

  // =========================
  // PATIENT
  // =========================
  let paciente = await prisma.patient.findFirst({
    where: {
      name: 'Carol',
      userId: admin.id,
    },
  });

  if (!paciente) {
    paciente = await prisma.patient.create({
      data: {
        name: 'Carol',
        age: 30,
        userId: admin.id,
      },
    });
  }

  // =========================
  // MEDICATIONS
  // =========================

  // Ibuprofeno
  let ibuprofeno = await prisma.medicacao.findFirst({
    where: { name: 'ibuprofeno' },
  });

  if (!ibuprofeno) {
    ibuprofeno = await prisma.medicacao.create({
      data: {
        name: 'ibuprofeno',
        maxDailyDose: 4000,
        minIntervalHours: 8,
      },
    });
  }

  // Aspirina
  let aspirina = await prisma.medicacao.findFirst({
    where: { name: 'aspirina' },
  });

  if (!aspirina) {
    aspirina = await prisma.medicacao.create({
      data: {
        name: 'aspirina',
        maxDailyDose: 3000,
        minIntervalHours: 6,
      },
    });
  }

  // Paracetamol
  let paracetamol = await prisma.medicacao.findFirst({
    where: { name: 'paracetamol' },
  });

  if (!paracetamol) {
    paracetamol = await prisma.medicacao.create({
      data: {
        name: 'paracetamol',
        maxDailyDose: 4000,
        minIntervalHours: 6,
      },
    });
  }

  // =========================
  // PRESCRIPTION (IBUPROFENO)
  // =========================
  let prescricao = await prisma.prescricao.findFirst({
    where: {
      patientId: paciente.id,
      medicationId: ibuprofeno.id,
    },
  });

  if (!prescricao) {
    prescricao = await prisma.prescricao.create({
      data: {
        patientId: paciente.id,
        medicationId: ibuprofeno.id,
        dosage: 400,
        unit: 'mg',
        frequency: 8,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // =========================
  // USAGE RECORD
  // =========================
  const existingRecord = await prisma.registroDeUso.findFirst({
    where: {
      prescriptionId: prescricao.id,
      takenAt: {
        gte: new Date(Date.now() - 60000),
        lte: new Date(Date.now() + 60000),
      },
    },
  });

  if (!existingRecord) {
    await prisma.registroDeUso.create({
      data: {
        prescriptionId: prescricao.id,
        takenAt: new Date(),
        dose: 400,
      },
    });
  }

  console.log('Seed completed successfully 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });