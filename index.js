import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDB } from './config/database.js';

// Robust dynamic import for discord.js: some hosts/installers can leave
// different package layouts. Try the package root first, then fall back
// to the built `dist` entrypoint if present.
async function loadDiscord() {
  try {
    return await import('discord.js');
  } catch (e1) {
    try {
      return await import('discord.js/dist/index.js');
    } catch (e2) {
      console.error('Failed to import discord.js: ', e1 && e1.message ? e1.message : e1, e2 && e2.message ? e2.message : e2);
      return null;
    }
  }
}

const discord = await loadDiscord();
if (!discord) {
  console.error('discord.js could not be loaded. Ensure it is installed correctly.');
  process.exit(1);
}
const { Client, GatewayIntentBits } = discord;

// HTTP server removed — this runtime no longer starts an embedded web server.

const DISABLE_GATEWAY = !!(process.env.DISABLE_GATEWAY || process.env.INTERACTIONS_ONLY);

let client;
if (!DISABLE_GATEWAY) {
  client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('error', (err) => console.error('Client error:', err));

  if (!process.env.TOKEN) {
    console.error('TOKEN is missing in environment');
    process.exit(1);
  }

  // Call login exactly once.
  client.login(process.env.TOKEN).catch(err => {
    console.error('Failed to login:', err);
    process.exit(1);
  });
} else {
  console.log('DISABLE_GATEWAY is set — running in interactions-only (webhook) mode');
}

// Express-based HTTP server and Discord interactions webhook removed.
// If you need webhook handling later, restore the Express code and routes.
