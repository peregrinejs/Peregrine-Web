const logargs = (message: string): string[] => {
  return [
    `%cPeregrine%c ${message}`,
    'background: #19657d; margin-top: -1px; padding: 1px 7px 0; color: #fff',
    '',
  ]
}

export const log = {
  debug: (message: string, ...args: any[]): void => {
    console.debug(...logargs(message), ...args)
  },
  info: (message: string, ...args: any[]): void => {
    console.info(...logargs(message), ...args)
  },
  error: (message: string, ...args: any[]): void => {
    console.error(...logargs(message), ...args)
  },
}
