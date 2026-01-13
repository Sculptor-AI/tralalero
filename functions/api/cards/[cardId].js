import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

// Helper to check card ownership via column and board
async function getCardForUser(env, userId, cardId) {
  const card = await env.DB.prepare(
    `SELECT ca.*, c.board_id, b.user_id
     FROM cards ca
     JOIN columns c ON ca.column_id = c.id
     JOIN boards b ON c.board_id = b.id
     WHERE ca.id = ? AND b.user_id = ?`
  ).bind(cardId, userId).first();
  return card;
}

// GET /api/cards/:cardId - Get a single card
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { cardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const card = await getCardForUser(env, user.id, cardId);

    if (!card) {
      return errorResponse('Card not found', 404);
    }

    return jsonResponse({
      card: {
        id: card.id,
        columnId: card.column_id,
        title: card.title,
        description: card.description,
        labels: card.labels ? JSON.parse(card.labels) : [],
        priority: card.priority,
        position: card.position,
      },
    });

  } catch (error) {
    console.error('Get card error:', error);
    return errorResponse('Failed to get card', 500);
  }
}

// PUT /api/cards/:cardId - Update card
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const { cardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const card = await getCardForUser(env, user.id, cardId);

    if (!card) {
      return errorResponse('Card not found', 404);
    }

    const { title, description, labels, priority, columnId, position } = await request.json();

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (!title.trim()) {
        return errorResponse('Card title cannot be empty', 400);
      }
      updates.push('title = ?');
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (labels !== undefined) {
      updates.push('labels = ?');
      values.push(JSON.stringify(labels));
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }
    if (columnId !== undefined) {
      // Verify the new column belongs to the user
      const newColumn = await env.DB.prepare(
        `SELECT c.* FROM columns c
         JOIN boards b ON c.board_id = b.id
         WHERE c.id = ? AND b.user_id = ?`
      ).bind(columnId, user.id).first();

      if (!newColumn) {
        return errorResponse('Target column not found', 404);
      }

      updates.push('column_id = ?');
      values.push(columnId);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }

    if (updates.length === 0) {
      return errorResponse('No updates provided', 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(cardId);

    await env.DB.prepare(
      `UPDATE cards SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    // Get updated card
    const updatedCard = await env.DB.prepare(
      'SELECT * FROM cards WHERE id = ?'
    ).bind(cardId).first();

    return jsonResponse({
      card: {
        id: updatedCard.id,
        columnId: updatedCard.column_id,
        title: updatedCard.title,
        description: updatedCard.description,
        labels: updatedCard.labels ? JSON.parse(updatedCard.labels) : [],
        priority: updatedCard.priority,
        position: updatedCard.position,
      },
    });

  } catch (error) {
    console.error('Update card error:', error);
    return errorResponse('Failed to update card', 500);
  }
}

// DELETE /api/cards/:cardId - Delete card
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { cardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const card = await getCardForUser(env, user.id, cardId);

    if (!card) {
      return errorResponse('Card not found', 404);
    }

    await env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(cardId).run();

    // Reorder remaining cards in the column
    await env.DB.prepare(`
      UPDATE cards
      SET position = position - 1
      WHERE column_id = ? AND position > ?
    `).bind(card.column_id, card.position).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Delete card error:', error);
    return errorResponse('Failed to delete card', 500);
  }
}
