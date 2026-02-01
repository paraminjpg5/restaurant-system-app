import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema";
import mysql from "mysql2/promise";

async function seed() {
  console.log("Seeding database...");
  
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant",
  });

  const db = drizzle(connection, { schema });

  // Clear existing data
  await connection.execute("DELETE FROM favorites");
  await connection.execute("DELETE FROM orderItems");
  await connection.execute("DELETE FROM orders");
  await connection.execute("DELETE FROM menuItemCustomizations");
  await connection.execute("DELETE FROM customizationValues");
  await connection.execute("DELETE FROM customizationOptions");
  await connection.execute("DELETE FROM menuItems");
  await connection.execute("DELETE FROM categories");

  // Create categories
  await db.insert(schema.categories).values([
    {
      name: "ก๋วยเตี๋ยว",
      description: "ก๋วยเตี๋ยวสูตรดั้งเดิมอร่อยๆ",
      order: 1,
    },
    {
      name: "ข้าวราด",
      description: "ข้าวราดกับแกงและเนื้อสัตว์",
      order: 2,
    },
    {
      name: "เครื่องดื่ม",
      description: "เครื่องดื่มเย็นและร้อน",
      order: 3,
    },
  ]);

  // Create customization options
  await db.insert(schema.customizationOptions).values([
    {
      name: "ระดับความหวาน",
      type: "sweetness",
    },
    {
      name: "ท็อปปิ้ง",
      type: "topping",
    },
  ]);

  // Create customization values for sweetness
  await db.insert(schema.customizationValues).values([
    {
      customizationOptionId: 1,
      value: "ไม่หวาน",
      price: "0",
      order: 1,
    },
    {
      customizationOptionId: 1,
      value: "หวานน้อย",
      price: "0",
      order: 2,
    },
    {
      customizationOptionId: 1,
      value: "หวานปกติ",
      price: "0",
      order: 3,
    },
    {
      customizationOptionId: 1,
      value: "หวานมาก",
      price: "0",
      order: 4,
    },
  ]);

  // Create customization values for toppings
  await db.insert(schema.customizationValues).values([
    {
      customizationOptionId: 2,
      value: "ไม่ใส่ท็อปปิ้ง",
      price: "0",
      order: 1,
    },
    {
      customizationOptionId: 2,
      value: "ใส่ไข่",
      price: "5",
      order: 2,
    },
    {
      customizationOptionId: 2,
      value: "ใส่หมู",
      price: "10",
      order: 3,
    },
    {
      customizationOptionId: 2,
      value: "ใส่ไก่",
      price: "10",
      order: 4,
    },
  ]);

  // Create menu items
  await db.insert(schema.menuItems).values([
    {
      categoryId: 1,
      name: "ก๋วยเตี๋ยวน้อย",
      description: "ก๋วยเตี๋ยวน้อยรสเด็ด",
      price: "40",
      available: true,
      order: 1,
    },
    {
      categoryId: 1,
      name: "ร้อยหลี่หมู",
      description: "ร้อยหลี่หมูสูตรพิเศษ",
      price: "45",
      available: true,
      order: 2,
    },
    {
      categoryId: 2,
      name: "ข้าวไก่",
      description: "ข้าวไก่ต้มน้ำปลา",
      price: "50",
      available: true,
      order: 1,
    },
    {
      categoryId: 2,
      name: "ข้าวหมู",
      description: "ข้าวหมูแดงสูตรเด็ด",
      price: "55",
      available: true,
      order: 2,
    },
    {
      categoryId: 3,
      name: "น้ำส้มสด",
      description: "น้ำส้มสดคั้นสด",
      price: "25",
      available: true,
      order: 1,
    },
    {
      categoryId: 3,
      name: "ชาเย็น",
      description: "ชาเย็นสูตรเด็ด",
      price: "20",
      available: true,
      order: 2,
    },
  ]);

  // Link menu items to customizations
  await db.insert(schema.menuItemCustomizations).values([
    {
      menuItemId: 1,
      customizationOptionId: 1,
      required: true,
    },
    {
      menuItemId: 1,
      customizationOptionId: 2,
      required: false,
    },
    {
      menuItemId: 2,
      customizationOptionId: 1,
      required: true,
    },
    {
      menuItemId: 2,
      customizationOptionId: 2,
      required: false,
    },
  ]);

  console.log("Database seeded successfully!");
  await connection.end();
}

seed().catch(console.error);
