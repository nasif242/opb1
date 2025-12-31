import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Balance from "../models/Balance.js";

// placeholder for your custom currency emoji. Set to a string like '<:yen:12345>'
const CURRENCY_EMOJI = null;
const CURRENCY_SYMBOL = "¥";

export const data = new SlashCommandBuilder().setName("balance").setDescription("Show your balance");

export async function execute(interactionOrMessage, client) {
  const isInteraction = typeof interactionOrMessage.isCommand === "function" || typeof interactionOrMessage.isChatInputCommand === "function";
  const channel = isInteraction ? interactionOrMessage.channel : interactionOrMessage.channel;
  let user;
  if (isInteraction) {
    user = interactionOrMessage.user;
  } else {
    // allow `op balance @user` to view another user
    const parts = interactionOrMessage.content.trim().split(/\s+/);
    if (parts[2]) {
      const maybe = parts[2].replace(/[^0-9]/g, "");
      if (maybe) user = { id: maybe, username: parts[2] };
    }
    if (!user) user = interactionOrMessage.author;
  }
  const userId = user.id;

  // Ensure we have a proper Discord `User` to read username/avatar from
  let displayUser = user;
  try {
    if (!displayUser || typeof displayUser.displayAvatarURL !== "function" || !displayUser.username) {
      displayUser = await client.users.fetch(userId).catch(() => null);
    }
  } catch (e) {
    displayUser = displayUser || null;
  }

  const displayName = (displayUser && displayUser.username) ? displayUser.username : (user && user.username) ? user.username : `User ${userId}`;
  const avatarURL = (displayUser && typeof displayUser.displayAvatarURL === "function") ? displayUser.displayAvatarURL() : null;

  let bal = await Balance.findOne({ userId });
  if (!bal) {
    bal = new Balance({ userId, amount: 500 });
    await bal.save();
  }

  const emoji = CURRENCY_EMOJI ? `${CURRENCY_EMOJI} ` : "";
  const embed = new EmbedBuilder()
    .setTitle(`${displayName}'s Balance`)
    .setColor(0xFFFFFF)
    .addFields(
      { name: "Balance", value: `${emoji}${CURRENCY_SYMBOL} ${bal.amount}`, inline: true },
      { name: "Reset Tokens", value: `${bal.resetTokens || 0}`, inline: true }
    )
    .setThumbnail(avatarURL)
    .setFooter({ text: "Currency: earned via quests, gambling, selling cards (TODO)" });

  if (isInteraction) {
    await interactionOrMessage.reply({ embeds: [embed] });
  } else {
    await channel.send({ embeds: [embed] });
  }
}
