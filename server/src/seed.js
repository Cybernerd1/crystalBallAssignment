import 'dotenv/config';

import mongoose from 'mongoose';

import { connectToDatabase } from './config/db.js';
import User from './models/User.js';

// Deterministic pseudo-random generator so repeated seeds produce the same
// demo data set.
let seedState = 42;
function rand() {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
}

const FIRST_NAMES = [
  'Amara', 'Priya', 'Diego', 'Noah', 'Lena', 'Mateo', 'Sofia', 'Arjun', 'Ivy', 'Kwame',
  'Elena', 'Omar', 'Freya', 'Théo', 'Mei', 'Rafa', 'Nia', 'Lucas', 'Aisha', 'Tomas',
  'Hana', 'Bruno', 'Zara', 'Ivan', 'Cleo', 'Farid', 'June', 'Levi', 'Mira', 'Nadim',
  'Odessa', 'Pedro', 'Quinn', 'Rhea', 'Samir', 'Talia', 'Umberto', 'Vera', 'Wren', 'Xavi',
];

const LAST_NAMES = [
  'Okafor', 'Sharma', 'Rivera', 'Novak', 'Petrova', 'Alvarez', 'Costa', 'Kapoor', 'Chen', 'Mensah',
  'Vasquez', 'Haddad', 'Lindqvist', 'Moreau', 'Wong', 'Silva', 'Johnson', 'Meyer', 'Bello', 'Novy',
  'Sato', 'Fern', 'Ahmed', 'Kuznet', 'Reyes', 'Aziz', 'Keller', 'Brand', 'Nagel', 'Kaur',
  'Volkov', 'Diaz', 'Zhang', 'Ivanov', 'Rossi', 'Bauer', 'Nguyen', 'Olson', 'Perez', 'Dupont',
];

const DOMAINS = ['gmail.com', 'outlook.com', 'protonmail.com', 'forma.dev'];

function slug(text) {
  return text
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

function buildUsers() {
  const total = 64;
  const users = [];
  const usedEmails = new Set();

  for (let i = 0; i < total; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const domain = DOMAINS[i % DOMAINS.length];

    // Guarantee uniqueness even when (first, last) pairs repeat
    let email = `${slug(first)}.${slug(last)}${i}@${domain}`;
    while (usedEmails.has(email)) {
      email = `${slug(first)}.${slug(last)}${i + total}@${domain}`;
    }
    usedEmails.add(email);

    const roleRoll = rand();
    const role = roleRoll < 0.16 ? 'admin' : roleRoll < 0.5 ? 'editor' : 'viewer';
    const status = rand() < 0.72 ? 'active' : 'inactive';
    const withPhone = rand() < 0.55;

    // Spread creation dates across ~10 weeks; the first records land inside
    // the current week so the "new this week" stat has data.
    const daysAgo = i === 0 ? 0.1 : i * 1.45;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    users.push({
      name: `${first} ${last}`,
      email,
      role,
      status,
      phone: withPhone ? `+1 ${200 + (i % 700)} ${1000 + i}` : '',
      createdAt,
      updatedAt: createdAt,
    });
  }

  return users;
}

try {
  await connectToDatabase();

  await User.deleteMany({});
  const created = await User.insertMany(buildUsers());

  console.log(`[seed] Cleared the users collection and inserted ${created.length} demo users.`);
  await mongoose.disconnect();
  process.exit(0);
} catch (err) {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
}
