import { getUserFromRequest, generateId, jsonResponse, errorResponse } from '../../_utils.js';

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

// POST /api/columns/:columnId/cards - Create a new card
export async function onRequestPost(context) {
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

    const { title, description = '', labels = [], priority = null } = await request.json();

    if (!title || !title.trim()) {
      return errorResponse('Card title is required', 400);
    }

    // Get the next position
    const maxPosition = await env.DB.prepare(
      'SELECT MAX(position) as max_pos FROM cards WHERE column_id = ?'
    ).bind(columnId).first();

    const position = (maxPosition?.max_pos ?? -1) + 1;
    const cardId = generateId();

    await env.DB.prepare(
      'INSERT INTO cards (id, column_id, title, description, labels, priority, position) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(cardId, columnId, title.trim(), description, JSON.stringify(labels), priority, position).run();

    return jsonResponse({
      card: {
        id: cardId,
        columnId,
        title: title.trim(),
        description,
        labels,
        priority,
        position,
      },
    }, 201);

  } catch (error) {
    console.error('Create card error:', error);
    return errorResponse('Failed to create card', 500);
  }
}
