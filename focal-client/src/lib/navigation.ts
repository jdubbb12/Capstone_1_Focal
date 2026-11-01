export function safeReturnPath(target: unknown): string {
  return typeof target === 'string' && /^\/(?:feed|profile|edit-profile|boards|2d)(?:[?#].*)?$/.test(target)
    ? target : '/profile'
}
