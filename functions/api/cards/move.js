import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

// POST /api/cards/move - Move a card to a new position/column
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const { cardId, sourceColumnId, targetColumnId, newPosition } = await request.json();

    if (!cardId || !sourceColumnId || !targetColumnId || newPosition === undefined) {
      return errorResponse('cardId, sourceColumnId, targetColumnId, and newPosition are required', 400);
    }

    // Verify card ownership
    const card = await env.DB.prepare(
      `SELECT ca.*, b.user_id
       FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN boards b ON c.board_id = b.id
       WHERE ca.id = ? AND b.user_id = ?`
    ).bind(cardId, user.id).first();

    if (!card) {
      return errorResponse('Card not found', 404);
    }

    // Verify target column ownership
    const targetColumn = await env.DB.prepare(
      `SELECT c.* FROM columns c
       JOIN boards b ON c.board_id = b.id
       WHERE c.id = ? AND b.user_id = ?`
    ).bind(targetColumnId, user.id).first();

    if (!targetColumn) {
      return errorResponse('Target column not found', 404);
    }

    const oldPosition = card.position;
    const sameColumn = sourceColumnId === targetColumnId;

    if (sameColumn) {
      // Moving within the same column
      if (newPosition > oldPosition) {
        // Moving down - shift cards between old and new position up
        await env.DB.prepare(`
          UPDATE cards
          SET position = position - 1
          WHERE column_id = ? AND position > ? AND position <= ?
        `).bind(sourceColumnId, oldPosition, newPosition).run();
      } else if (newPosition < oldPosition) {
        // Moving up - shift cards between new and old position down
        await env.DB.prepare(`
          UPDATE cards
          SET position = position + 1
          WHERE column_id = ? AND position >= ? AND position < ?
        `).bind(sourceColumnId, newPosition, oldPosition).run();
      }
    } else {
      // Moving to a different column
      // Close the gap in the source column
      await env.DB.prepare(`
        UPDATE cards
        SET position = position - 1
        WHERE column_id = ? AND position > ?
      `).bind(sourceColumnId, oldPosition).run();

      // Make room in the target column
      await env.DB.prepare(`
        UPDATE cards
        SET position = position + 1
        WHERE column_id = ? AND position >= ?
      `).bind(targetColumnId, newPosition).run();
    }

    // Update the moved card
    await env.DB.prepare(`
      UPDATE cards
      SET column_id = ?, position = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(targetColumnId, newPosition, cardId).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Move card error:', error);
    return errorResponse('Failed to move card', 500);
  }
}
