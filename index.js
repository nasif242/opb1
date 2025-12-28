import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "dotenv";
import { connectDB } from "./config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();
await connectDB();

// Build intents. MessageContent is required for prefix message commands.
// Make sure you've enabled it on the Discord Developer Portal for the bot.
const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
];

const client = new Client({ intents });

client.commands = new Collection();

// dynamically load commands
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const imported = await import(`./commands/${file}`);
  const command = imported.default || imported; // normalize default vs named exports
  // compute a safe command name (lowercased) from the SlashCommandBuilder
  let cmdName;
  try {
    cmdName = (command.data && command.data.name) || (command.data && command.data.toJSON && command.data.toJSON().name) || file.replace(/\.js$/, "");
  } catch (e) {
    cmdName = file.replace(/\.js$/, "");
  }
  client.commands.set(String(cmdName).toLowerCase(), command);
  // register aliases if provided by the command module (e.g. ['inv','inventory'])
  if (command.aliases && Array.isArray(command.aliases)) {
    for (const a of command.aliases) {
      client.commands.set(String(a).toLowerCase(), command);
    }
  }
}
// simple message-based prefix handling: prefix is "op" (case-insensitive)
client.on("messageCreate", async (message) => {
  try {
    if (!message.content) return;
    if (message.author?.bot) return;

    const parts = message.content.trim().split(/\s+/);
    if (parts.length < 2) return;

    // prefix is the first token; must be 'op' case-insensitive
    if (parts[0].toLowerCase() !== "op") return;

    const commandName = parts[1].toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;

    // call the same execute exported for slash commands; pass message and client
    await command.execute(message, client);
  } catch (err) {
    console.error("Error handling message command:", err);
  }
});

// dynamically load events
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.TOKEN);

// Start a small HTTP server so Render and uptime monitors (e.g., UptimeRobot)
// can check that the service is alive. This avoids adding express as a
// dependency and works with Render's $PORT environment variable.
import http from "http";

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health" || req.url === "/_health")) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("OK");
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => console.log(`Health server listening on port ${PORT}`));
