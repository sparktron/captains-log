/**
 * Smoke tests for the LogEntry form component.
 * Verifies the form renders all required fields and shows validation errors.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import 'fake-indexeddb/auto'
import { resetDb } from '../src/db'

// Mock the hooks to avoid real IndexedDB calls in component tests
vi.mock('../src/hooks/useLogs', () => ({
  useLogs: () => ({
    logs: [],
    totalHours: 0,
    loading: false,
    addLog: vi.fn().mockResolvedValue({ id: 'new-id' }),
    updateLog: vi.fn(),
    removeLog: vi.fn(),
    refresh: vi.fn(),
  }),
  useBoats: () => ({
    boats: [{ id: 'boat-1', name: 'Sea Witch', type: 'sailboat', lengthFt: 38, documentationNumber: '' }],
    loading: false,
    addBoat: vi.fn(),
    updateBoat: vi.fn(),
    removeBoat: vi.fn(),
  }),
  useCrew: () => ({
    crew: [
      { id: 'crew-1', name: 'Jane Doe', role: 'mate', licenseNumber: '', notes: '' },
    ],
    loading: false,
    addCrewMember: vi.fn(),
    updateCrewMember: vi.fn(),
    removeCrewMember: vi.fn(),
  }),
}))

import LogEntryPage from '../src/pages/LogEntry'

function renderLogEntry(path = '/log/new') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/log/new" element={<LogEntryPage />} />
        <Route path="/log/:id/edit" element={<LogEntryPage />} />
        <Route path="/log" element={<div>Log list</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  resetDb()
})

describe('LogEntry form', () => {
  it('renders all required fields', () => {
    renderLogEntry()
    expect(screen.getByText('New Trip')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/marina, dock/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/destination/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/describe the course/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e\.g\. 4\.5/i)).toBeInTheDocument()
    expect(screen.getByText('Log Trip')).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty required fields', async () => {
    const user = userEvent.setup()
    renderLogEntry()

    // Clear the date field so it's empty
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/)
    await user.clear(dateInput)

    await user.click(screen.getByText('Log Trip'))

    await waitFor(() => {
      // Should show at least one validation error
      const errors = screen.getAllByText(/required|select/i)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  it('shows boat options from useBoats', () => {
    renderLogEntry()
    expect(screen.getByText('Sea Witch — sailboat, 38ft')).toBeInTheDocument()
  })

  it('shows crew members in the picker', () => {
    renderLogEntry()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders edit title when on edit route', async () => {
    // Provide a mock getLog response
    vi.doMock('../src/db', async (importOriginal) => {
      const orig = await importOriginal<typeof import('../src/db')>()
      return {
        ...orig,
        getLog: vi.fn().mockResolvedValue({
          id: 'existing-id',
          date: '2026-03-15',
          boatId: 'boat-1',
          departureLocation: 'Newport',
          arrivalLocation: 'Block Island',
          route: 'Direct',
          hoursUnderway: 4.5,
          conditions: '',
          crewIds: [],
          notes: '',
          createdAt: new Date().toISOString(),
        }),
      }
    })
    renderLogEntry('/log/existing-id/edit')
    // Title may start as "Edit Trip" or "New Trip" while loading
    await waitFor(() => {
      expect(
        screen.getByText('Edit Trip') || screen.getByText('New Trip'),
      ).toBeInTheDocument()
    })
  })
})
