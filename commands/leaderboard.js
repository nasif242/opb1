import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Balance from '../models/Balance.js';
import Progress from '../models/Progress.js';

export const data = new SlashCommandBuilder().setName('leaderboard').setDescription('Show leaderboards (level, wealth, collection)');

export const aliases = ['lb'];

export async function execute(interactionOrMessage, client) {
  const isInteraction = typeof interactionOrMessage.isCommand === 'function' || typeof interactionOrMessage.isChatInputCommand === 'function';
  const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
  const channel = isInteraction ? interactionOrMessage.channel : interactionOrMessage.channel;
  const userId = String(user.id);

  // Build initial leaderboard (level)
  try {
    // Query top 10 by level
    const topLevel = await Balance.find({}).sort({ level: -1, xp: -1 }).limit(10).lean();

    // Build lines
    const lines = await Promise.all(topLevel.map(async (b, idx) => {
      let name = b.userId;
      try { const u = await client.users.fetch(String(b.userId)).catch(() => null); if (u) name = u.username; } catch (e) {}
      return `**${idx + 1}. ${name}** — Level: ${b.level || 0}`;
    }));

    const embed = new EmbedBuilder().setTitle('Leaderboard — Level').setColor(0xFFFFFF).setDescription(lines.join('\n') || 'No data');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`leaderboard_level:${userId}`).setLabel('Level').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`leaderboard_wealth:${userId}`).setLabel('Wealth').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`leaderboard_collection:${userId}`).setLabel('Collection').setStyle(ButtonStyle.Secondary)
    );

    if (isInteraction) {
      await interactionOrMessage.reply({ embeds: [embed], components: [row] });
    } else {
      await channel.send({ embeds: [embed], components: [row] });
    }
  } catch (e) {
    console.error('Error building leaderboard:', e && e.message ? e.message : e);
    const reply = 'Unable to build leaderboard at this time.';
    if (isInteraction) return interactionOrMessage.reply({ content: reply, ephemeral: true });
    return channel.send(reply);
  }
}

export const description = 'Show player leaderboards for level, wealth, and collection size';
