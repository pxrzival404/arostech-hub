import { render, screen } from '@testing-library/react'
import Page from '@/app/chat/page'
import { AgentChat } from '@21st-sdk/nextjs'

jest.mock('@21st-sdk/nextjs', () => ({
  AgentChat: jest.fn(() => <div data-testid="agent-chat" />),
  createAgentChat: jest.fn(() => ({})),
}))

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    status: 'idle',
    stop: jest.fn(),
    error: null,
  })),
}))

describe('Chat Page', () => {
  it('renders the AgentChat component', () => {
    render(<Page />)
    expect(screen.getByTestId('agent-chat')).toBeInTheDocument()
  })

  it('passes the correct props to AgentChat', () => {
    render(<Page />)
    expect(AgentChat).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: 'idle',
        messages: [],
      }),
      undefined
    )
  })
})
