import { detectPlatform } from '../Platform'

describe('detectPlatform', () => {
  it('should detect iPhone', () => {
    const context = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        platform: 'iPhone',
        maxTouchPoints: 5,
      },
    } as Window

    expect(detectPlatform(context)).toEqual('ios')
  })

  it('should detect newer iPads', () => {
    const context = {
      navigator: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
    } as Window

    expect(detectPlatform(context)).toEqual('ios')
  })

  it('should detect older iPads', () => {
    const context = {
      navigator: {
        userAgent:
          'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
    } as Window

    expect(detectPlatform(context)).toEqual('ios')
  })
})
