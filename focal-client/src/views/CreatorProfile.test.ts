import { mount } from '@vue/test-utils'
import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
vi.mock('../stores/auth', () => ({ auth: { user: computed(() => ({ first_name:'Real', last_name:'Creator', username:'real_creator', bio:'A database-backed bio', creative_role:'architect', interests:[{ interest_id:1, name:'Architecture' }] })) } }))
import CreatorProfile from './CreatorProfile.vue'
describe('connected creator profile', () => {
  it('shows the actual account, not the sample creator', () => {
    const wrapper = mount(CreatorProfile, { global: { stubs:['FocalNav','RouterLink'] } })
    expect(wrapper.get('h1').text()).toBe('Real Creator')
    expect(wrapper.text()).toContain('A database-backed bio')
    expect(wrapper.text()).toContain('Architecture')
    expect(wrapper.text()).not.toContain('First & Last Name')
    expect(wrapper.text()).toContain('preview')
  })
})
