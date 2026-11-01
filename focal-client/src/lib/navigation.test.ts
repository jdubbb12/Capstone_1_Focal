import { describe, expect, it } from 'vitest'
import { safeReturnPath } from './navigation'
describe('return navigation', () => {
  it.each(['/creator', '/inspiration'])('preserves the branchs supported legacy URL %s', target => {
    expect(safeReturnPath(target)).toBe(target)
  })
  it('preserves a supported internal return path', () => { expect(safeReturnPath('/edit-profile')).toBe('/edit-profile') })
  it.each(['https://attacker.example','//attacker.example','/\\attacker.example','javascript:alert(1)','/login',null,['/feed']])('rejects an unsafe or authentication target %j', target => {
    expect(safeReturnPath(target)).toBe('/profile')
  })
})
