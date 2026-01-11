import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../LanguageSwitcher'

// Mock the useI18next hook
const mockChangeLanguage = jest.fn()
jest.mock('gatsby-plugin-react-i18next', () => ({
  useI18next: () => ({
    languages: ['en', 'zh', 'yue', 'ms'],
    language: 'en',
    changeLanguage: mockChangeLanguage,
  }),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    mockChangeLanguage.mockClear()
  })

  it('renders trigger button with current language', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens dropdown when trigger is clicked', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('shows all language options in dropdown', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)

    const dropdown = screen.getByRole('listbox')
    expect(dropdown).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveTextContent('en')
    expect(options[1]).toHaveTextContent('中文')
    expect(options[2]).toHaveTextContent('粵語')
    expect(options[3]).toHaveTextContent('bm')
  })

  it('calls changeLanguage when selecting a language', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)
    const zhOption = screen.getByText('中文')
    fireEvent.click(zhOption)

    expect(mockChangeLanguage).toHaveBeenCalledWith('zh')
  })

  it('closes dropdown after selecting a language', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)
    const zhOption = screen.getByText('中文')
    fireEvent.click(zhOption)

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes dropdown on Escape key', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('has correct navigation role and label', () => {
    render(<LanguageSwitcher />)
    const nav = screen.getByRole('navigation', { name: /language selection/i })
    expect(nav).toBeInTheDocument()
  })

  it('sets lang attribute on language options', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('marks current language option as active', () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: /en/i })

    fireEvent.click(trigger)

    const enOption = screen.getByRole('option', { selected: true })
    expect(enOption).toBeInTheDocument()
  })
})
