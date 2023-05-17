type Platform = 'android' | 'ios'

export function detectPlatform(context: Window): Platform | null {
  const {
    navigator: { maxTouchPoints, platform, userAgent },
  } = context

  if (/android/i.test(userAgent)) {
    return 'android'
  }

  if (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)
  ) {
    return 'ios'
  }

  return null
}

export default Platform
