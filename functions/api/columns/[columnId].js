import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

// Helper to check column ownership via board
async function getColumnForUser(env, userId, columnId) {
  const column = await env.DB.prepare(
    `SELECT c.*, b.user_id
     FROM columns c
     JOIN boards b ON c.board_id = b.id
     WHERE c.id = ? AND b.user_id = ?`
  ).bind(columnId, userId).first();
  return column;
}

// PUT /api/columns/:columnId - Update column
export async function onRequestPut(context) {
  const { request, env, params } = context;
  const { columnId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const column = await getColumnForUser(env, user.id, columnId);

    if (!column) {
      return errorResponse('Column not found', 404);
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return errorResponse('Column title is required', 400);
    }

    await env.DB.prepare(
      'UPDATE columns SET title = ? WHERE id = ?'
    ).bind(title.trim(), columnId).run();

    return jsonResponse({
      column: {
        id: columnId,
        title: title.trim(),
        boardId: column.board_id,
        position: column.position,
      },
    });

  } catch (error) {
    console.error('Update column error:', error);
    return errorResponse('Failed to update column', 500);
  }
}

// DELETE /api/columns/:columnId - Delete column
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { columnId } = params;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const column = await getColumnForUser(env, user.id, columnId);

    if (!column) {
      return errorResponse('Column not found', 404);
    }

    // Delete column (cascades to cards)
    await env.DB.prepare('DELETE FROM columns WHERE id = ?').bind(columnId).run();

    // Reorder remaining columns
    await env.DB.prepare(`
      UPDATE columns
      SET position = position - 1
      WHERE board_id = ? AND position > ?
    `).bind(column.board_id, column.position).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Delete column error:', error);
    return errorResponse('Failed to delete column', 500);
  }
}
