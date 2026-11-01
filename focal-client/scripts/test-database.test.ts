import { describe, expect, it } from 'vitest'
import { requireTestDatabase } from './test-database.mjs'
describe('isolated integration database guard', () => {
  it('accepts a dedicated test database without rewriting its connection string', () => {
    const url = 'postgresql://fixture:example@127.0.0.1:55432/focal_test'
    expect(requireTestDatabase(url, 'postgresql://fixture:example@localhost:55432/focal_development')).toBe(url)
  })
  it.each([
    ['postgres://one:fake@localhost/focal_test', 'postgresql://two:fake@127.0.0.1:5432/focal_test'],
    ['postgresql://one:fake@[::1]:55432/focal_test?sslmode=disable', 'postgresql://two:fake@localhost:55432/focal_test'],
    ['postgresql://one:fake@LOCALHOST:55432/focal%5Ftest', 'postgresql://two:fake@127.0.0.1:55432/focal_test'],
    ['postgresql://one:fake@db.example:5432/focal_test', 'postgresql://two:fake@DB.EXAMPLE/focal_test'],
  ])('rejects equivalent database identities regardless of URL spelling', (url,dev) => {
    expect(() => requireTestDatabase(url,dev)).toThrow('separate')
  })
  it.each([undefined,'invalid','https://fixture:example@localhost/focal_test','postgresql://fixture:example@localhost/focal_development'])('rejects a missing, invalid, or non-test target', url => {
    expect(() => requireTestDatabase(url)).toThrow()
  })
})
