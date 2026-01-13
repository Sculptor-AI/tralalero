import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ success: true }); // Already logged out
    }

    const token = authHeader.slice(7);

    // Delete the session
    await env.DB.prepare(
      'DELETE FROM sessions WHERE token = ?'
    ).bind(token).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse('Failed to logout', 500);
  }
}
