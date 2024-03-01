import * as rizzkey from 'rizzkey-js';
import { UnicodeEmojiDef } from './emojilist.js';

export function checkReactionPermissions(me: rizzkey.entities.MeDetailed, note: rizzkey.entities.Note, emoji: rizzkey.entities.EmojiSimple | UnicodeEmojiDef): boolean {
  if ('char' in emoji) return true; // UnicodeEmojiDefなら常にリアクション可能

  emoji = emoji as rizzkey.entities.EmojiSimple;
  const roleIdsThatCanBeUsedThisEmojiAsReaction = emoji.roleIdsThatCanBeUsedThisEmojiAsReaction ?? [];
  return !(emoji.localOnly && note.user.host !== me.host)
      && !(emoji.isSensitive && (note.reactionAcceptance === 'nonSensitiveOnly' || note.reactionAcceptance === 'nonSensitiveOnlyForLocalLikeOnlyForRemote'))
      && (roleIdsThatCanBeUsedThisEmojiAsReaction.length === 0 || me.roles.some(role => roleIdsThatCanBeUsedThisEmojiAsReaction.includes(role.id)));
}
