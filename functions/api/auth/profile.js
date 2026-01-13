import { getUserFromRequest, hashPassword, jsonResponse, errorResponse } from '../_utils.js';

export async function onRequestPut(context) {
  const { request, env } = context;

  try {
    const user = await getUserFromRequest(request, env);

    if (!user) {
      return errorResponse('Not authenticated', 401);
    }

    const { name, avatar, currentPassword, newPassword } = await request.json();

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse('Current password is required to change password', 400);
      }

      if (newPassword.length < 8) {
        return errorResponse('New password must be at least 8 characters', 400);
      }

      const fullUser = await env.DB.prepare(
        'SELECT password_hash FROM users WHERE id = ?'
      ).bind(user.id).first();

      const { verifyPassword } = await import('../_utils.js');
      const isValid = await verifyPassword(currentPassword, fullUser.password_hash);
      if (!isValid) {
        return errorResponse('Current password is incorrect', 401);
      }

      const newPasswordHash = await hashPassword(newPassword);
      await env.DB.prepare(
        'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?'
      ).bind(newPasswordHash, user.id).run();
    }

    // Update other fields
    if (name !== undefined || avatar !== undefined) {
      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (avatar !== undefined) {
        updates.push('avatar = ?');
        values.push(avatar);
      }

      updates.push('updated_at = datetime("now")');
      values.push(user.id);

      await env.DB.prepare(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    }

    // Get updated user
    const updatedUser = await env.DB.prepare(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = ?'
    ).bind(user.id).first();

    return jsonResponse({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.created_at,
      },
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
