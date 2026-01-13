import { getUserFromRequest, generateId, jsonResponse, errorResponse } from '../../_utils.js';

// Helper to check board ownership
async function getBoardForUser(env, userId, boardId) {
  return await env.DB.prepare(
    'SELECT * FROM boards WHERE id = ? AND user_id = ?'
  ).bind(boardId, userId).first();
}

// POST /api/boards/:boardId/columns - Create a new column
export async function onRequestPost(context) {
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

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return errorResponse('Column title is required', 400);
    }

    // Get the next position
    const maxPosition = await env.DB.prepare(
      'SELECT MAX(position) as max_pos FROM columns WHERE board_id = ?'
    ).bind(boardId).first();

    const position = (maxPosition?.max_pos ?? -1) + 1;
    const columnId = generateId();

    await env.DB.prepare(
      'INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)'
    ).bind(columnId, boardId, title.trim(), position).run();

    return jsonResponse({
      column: {
        id: columnId,
        boardId,
        title: title.trim(),
        position,
        cards: [],
      },
    }, 201);

  } catch (error) {
    console.error('Create column error:', error);
    return errorResponse('Failed to create column', 500);
  }
}

// PUT /api/boards/:boardId/columns - Reorder columns
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

    const { columnOrder } = await request.json();

    if (!Array.isArray(columnOrder)) {
      return errorResponse('columnOrder must be an array', 400);
    }

    // Update positions
    for (let i = 0; i < columnOrder.length; i++) {
      await env.DB.prepare(
        'UPDATE columns SET position = ? WHERE id = ? AND board_id = ?'
      ).bind(i, columnOrder[i], boardId).run();
    }

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Reorder columns error:', error);
    return errorResponse('Failed to reorder columns', 500);
  }
}
