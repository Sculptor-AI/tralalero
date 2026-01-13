import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

// Helper to check board ownership
async function getBoardForUser(env, userId, boardId) {
  return await env.DB.prepare(
    'SELECT * FROM boards WHERE id = ? AND user_id = ?'
  ).bind(boardId, userId).first();
}

// GET /api/boards/:boardId - Get a single board with all columns and cards
export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { boardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const board = await getBoardForUser(env, user.id, boardId);

    if (!board) {
      return errorResponse('Board not found', 404);
    }

    // Get columns
    const columnsResult = await env.DB.prepare(
      'SELECT id, title, position FROM columns WHERE board_id = ? ORDER BY position ASC'
    ).bind(boardId).all();

    const columns = columnsResult.results || [];

    // Get cards for all columns
    const columnIds = columns.map(c => c.id);
    let cards = [];

    if (columnIds.length > 0) {
      const placeholders = columnIds.map(() => '?').join(',');
      const cardsResult = await env.DB.prepare(
        `SELECT id, column_id, title, description, labels, priority, position
         FROM cards
         WHERE column_id IN (${placeholders})
         ORDER BY position ASC`
      ).bind(...columnIds).all();

      cards = (cardsResult.results || []).map(card => ({
        ...card,
        labels: card.labels ? JSON.parse(card.labels) : [],
      }));
    }

    // Organize cards by column
    const columnsWithCards = columns.map(col => ({
      ...col,
      cards: cards.filter(card => card.column_id === col.id),
    }));

    return jsonResponse({
      board: {
        id: board.id,
        name: board.name,
        icon: board.icon,
        color: board.color,
      },
      columns: columnsWithCards,
    });

  } catch (error) {
    console.error('Get board error:', error);
    return errorResponse('Failed to get board', 500);
  }
}

// PUT /api/boards/:boardId - Update board details
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const { boardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const board = await getBoardForUser(env, user.id, boardId);

    if (!board) {
      return errorResponse('Board not found', 404);
    }

    const { name, icon, color } = await request.json();

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }

    if (updates.length === 0) {
      return errorResponse('No updates provided', 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(boardId);

    await env.DB.prepare(
      `UPDATE boards SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return jsonResponse({
      board: {
        id: boardId,
        name: name !== undefined ? name.trim() : board.name,
        icon: icon !== undefined ? icon : board.icon,
        color: color !== undefined ? color : board.color,
      },
    });

  } catch (error) {
    console.error('Update board error:', error);
    return errorResponse('Failed to update board', 500);
  }
}

// DELETE /api/boards/:boardId - Delete a board
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { boardId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const board = await getBoardForUser(env, user.id, boardId);

    if (!board) {
      return errorResponse('Board not found', 404);
    }

    // Delete board (cascades to columns and cards due to foreign keys)
    await env.DB.prepare('DELETE FROM boards WHERE id = ?').bind(boardId).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Delete board error:', error);
    return errorResponse('Failed to delete board', 500);
  }
}
