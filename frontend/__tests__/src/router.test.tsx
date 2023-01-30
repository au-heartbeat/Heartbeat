import { render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Router from '@src/router'
import { Provider } from 'react-redux'
import { store } from '@src/store/store'

describe('router', () => {
  const setup = (routeUrl: string) =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[routeUrl]}>
          <Router />
        </MemoryRouter>
      </Provider>
    )

  it('should show home page when loading on a bad page', async () => {
    const badRoute = '/some/bad/route'

    setup(badRoute)

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/')
    })
  })

  it('should show home page when go home page', async () => {
    const homeRoute = '/home'

    setup(homeRoute)

    await waitFor(() => {
      expect(window.location.pathname).toEqual('/')
    })
  })

  it('should show metrics page when go metrics page', async () => {
    const metricsRoute = '/metrics'
    const steps = ['Config', 'Metrics', 'Export']

    const { getByText } = setup(metricsRoute)

    await waitFor(() => {
      expect(getByText('Heartbeat')).toBeInTheDocument()
      steps.map((label) => {
        expect(getByText(label)).toBeInTheDocument()
      })
    })
  })
})
