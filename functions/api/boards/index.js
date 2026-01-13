import { getUserFromRequest, generateId, jsonResponse, errorResponse } from '../_utils.js';

// GET /api/boards - Get all boards for the authenticated user
export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const boards = await env.DB.prepare(
      'SELECT id, name, icon, color, created_at, updated_at FROM boards WHERE user_id = ? ORDER BY created_at ASC'
    ).bind(user.id).all();

    return jsonResponse({ boards: boards.results || [] });

  } catch (error) {
    console.error('Get boards error:', error);
    return errorResponse('Failed to get boards', 500);
  }
}

// POST /api/boards - Create a new board
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const { name, icon = '📋', color = 'sky' } = await request.json();

    if (!name || !name.trim()) {
      return errorResponse('Board name is required', 400);
    }

    const boardId = generateId();

    await env.DB.prepare(
      'INSERT INTO boards (id, user_id, name, icon, color) VALUES (?, ?, ?, ?, ?)'
    ).bind(boardId, user.id, name.trim(), icon, color).run();

    // Create default columns
    const columns = [
      { id: generateId(), title: 'To Do', position: 0 },
      { id: generateId(), title: 'In Progress', position: 1 },
      { id: generateId(), title: 'Done', position: 2 },
    ];

    for (const col of columns) {
      await env.DB.prepare(
        'INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)'
      ).bind(col.id, boardId, col.title, col.position).run();
    }

    return jsonResponse({
      board: {
        id: boardId,
        name: name.trim(),
        icon,
        color,
      },
      columns: columns.map(c => ({ id: c.id, title: c.title, boardId })),
    }, 201);

  } catch (error) {
    console.error('Create board error:', error);
    return errorResponse('Failed to create board', 500);
  }
}
