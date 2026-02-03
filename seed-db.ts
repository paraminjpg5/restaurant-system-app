import { drizzle } from "drizzle-orm/mysql2";
import { categories, menuItems, customizationOptions, customizationValues } from "./drizzle/schema";

async function seedDatabase() {
  const db = drizzle(process.env.DATABASE_URL!);

  try {
    // Insert categories
    await db.insert(categories).values([
      { name: "ก๋วยเตี๋ยว", description: "ก๋วยเตี๋ยวสูตรเด็ด" },
      { name: "ข้าวราด", description: "ข้าวราดแกงต่างๆ" },
      { name: "น้ำซุป", description: "น้ำซุปร้อนๆ" },
    ]);

    // Insert menu items
    await db.insert(menuItems).values([
      {
        categoryId: 1,
        name: "ก๋วยเตี๋ยวเนื้อ",
        description: "ก๋วยเตี๋ยวเนื้อสด",
        price: "50.00",
      },
      {
        categoryId: 1,
        name: "ก๋วยเตี๋ยวหมู",
        description: "ก๋วยเตี๋ยวหมูสับ",
        price: "45.00",
      },
      {
        categoryId: 2,
        name: "ข้าวราดแกงเขียว",
        description: "ข้าวราดแกงเขียวไก่",
        price: "60.00",
      },
      {
        categoryId: 2,
        name: "ข้าวราดแกงแดง",
        description: "ข้าวราดแกงแดงเนื้อ",
        price: "65.00",
      },
      {
        categoryId: 3,
        name: "ต้มยำกุ้ง",
        description: "ต้มยำกุ้งสด",
        price: "70.00",
      },
    ]);

    // Insert customization options
    const optionIds = await db
      .insert(customizationOptions)
      .values([
        { menuItemId: 1, name: "ระดับความหวาน" },
        { menuItemId: 1, name: "ระดับความเผ็ด" },
      ])
      .$returningId();

    // Insert customization values
    if (optionIds[0]) {
      await db.insert(customizationValues).values([
        { optionId: optionIds[0].id, value: "ไม่หวาน", priceModifier: "0" },
        { optionId: optionIds[0].id, value: "หวานน้อย", priceModifier: "0" },
        { optionId: optionIds[0].id, value: "หวานปกติ", priceModifier: "0" },
        { optionId: optionIds[0].id, value: "หวานมาก", priceModifier: "0" },
      ]);
    }

    if (optionIds[1]) {
      await db.insert(customizationValues).values([
        { optionId: optionIds[1].id, value: "ไม่เผ็ด", priceModifier: "0" },
        { optionId: optionIds[1].id, value: "เผ็ดน้อย", priceModifier: "0" },
        { optionId: optionIds[1].id, value: "เผ็ดปกติ", priceModifier: "0" },
        { optionId: optionIds[1].id, value: "เผ็ดมาก", priceModifier: "0" },
      ]);
    }

    console.log("✓ Database seeded successfully!");
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
