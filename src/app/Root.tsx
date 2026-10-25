import { Outlet, ScrollRestoration } from 'react-router'
import { RouteEffects } from './RouteEffects'

export function Root() {
  return (
    <>
      <Outlet />
      <RouteEffects />
      <ScrollRestoration />
    </>
  )
}
