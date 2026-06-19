const { PrismaClient } = require('../app/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const languagesPath = path.join(__dirname, '../data/languages.json');
  const languagesData = JSON.parse(fs.readFileSync(languagesPath, 'utf8'));

  console.log('Seeding languages...');
  for (const lang of languagesData) {
    await prisma.language.upsert({
      where: { id: lang.id },
      update: {
        name: lang.name,
        native: lang.native,
        flag: lang.flag,
        isActive: lang.isActive,
      },
      create: {
        id: lang.id,
        name: lang.name,
        native: lang.native,
        flag: lang.flag,
        isActive: lang.isActive,
        lettersApplicable: true,
        wordsApplicable: true,
        patternsApplicable: true,
      },
    });
  }
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
