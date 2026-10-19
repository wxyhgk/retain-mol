import { describe, expect, it } from 'vitest'
import { readEmbedOptions } from './embed'

describe('readEmbedOptions', () => {
  it('reads the page around the frame and its theme', () => {
    expect(readEmbedOptions('?embed=1&parent=http://localhost:4321/studio?article=a&theme=night')).toEqual({
      parentOrigin: 'http://localhost:4321',
      theme: 'night',
    })
    expect(readEmbedOptions('?embed=1&parent=http%3A%2F%2F127.0.0.1%3A4400')).toEqual({ parentOrigin: 'http://127.0.0.1:4400', theme: null })
  })

  it('is not embedded without embed=1 or without a page to answer', () => {
    expect(readEmbedOptions('')).toBeNull()
    expect(readEmbedOptions('?parent=http://localhost:4321')).toBeNull()
    expect(readEmbedOptions('?embed=1')).toBeNull()
    expect(readEmbedOptions('?embed=1&parent=not a url')).toBeNull()
  })
})
