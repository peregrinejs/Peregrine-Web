export type Platform = 'android' | 'ios' | null

const platform: Platform =
  typeof navigator === 'undefined'
    ? null
    : /iPhone|iPod/i.test(navigator.userAgent)
    ? 'ios'
    : /android/i.test(navigator.userAgent)
    ? 'android'
    : null

export default platform
