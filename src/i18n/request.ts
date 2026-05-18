import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('KITAB_LOCALE')?.value

  const locale =
    localeCookie && routing.locales.includes(localeCookie as 'en' | 'ne')
      ? (localeCookie as 'en' | 'ne')
      : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
