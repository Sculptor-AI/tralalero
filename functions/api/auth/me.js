import { getUserFromRequest, jsonResponse, errorResponse } from '../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.created_at,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user', 500);
  }
}
