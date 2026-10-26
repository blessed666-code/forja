import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { sanitizePlainText } from '@/lib/security/validation'
import { createSupabaseAdminClient, getAuthenticatedAccount } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function PATCH(req: Request) {
  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud bloqueada por protección CSRF.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const targetUserId = sanitizePlainText(body.userId, 64)
    const isActive = Boolean(body.isActive)

    if (!/^[0-9a-f-]{36}$/i.test(targetUserId)) {
      return NextResponse.json({ error: 'Usuario inválido.' }, { status: 400, headers: NO_STORE_HEADERS })
    }

    if (targetUserId === account.userId && !isActive) {
      return NextResponse.json(
        { error: 'No puedes desactivar tu propia cuenta de administrador.' },
        { status: 400, headers: NO_STORE_HEADERS },
      )
    }

    const adminClient = createSupabaseAdminClient()
    const { error } = await adminClient
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', targetUserId)

    if (error) {
      return NextResponse.json({ error: 'No se pudo actualizar el estado del alumno.' }, { status: 500, headers: NO_STORE_HEADERS })
    }

    // Revoca inmediatamente todas las sesiones y tokens activos si la cuenta es suspendida
    if (!isActive) {
      await adminClient.auth.admin.signOut(targetUserId, 'global')
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Error actualizando usuario.' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}
