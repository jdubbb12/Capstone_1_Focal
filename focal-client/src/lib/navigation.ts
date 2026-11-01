export function safeReturnPath(target: unknown): string {
  return typeof target === 'string' && /^\/(?:feed|profile|edit-profile|boards|2d|creator|inspiration)(?:[?#].*)?$/.test(target)
    ? target : '/profile'
}
