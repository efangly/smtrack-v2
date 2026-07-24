import { NextResponse, type NextRequest } from 'next/server'

const TOKEN_COOKIE_NAME = 'smtrack.authToken'
const LOGIN_PATH = '/login'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value
  const isLoginPath = request.nextUrl.pathname === LOGIN_PATH

  if (!token && !isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    return NextResponse.redirect(url)
  }

  if (token && isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
