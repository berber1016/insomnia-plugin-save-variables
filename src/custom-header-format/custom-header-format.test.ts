import { createCustomHeader, isCustomHeader, parseCustomHeader } from './custom-header-format'
import { VariableDefinition } from './variable-definition'

describe('Custom Header Format', () => {
  it('should create and parse custom header', () => {
    const variableDefinition = {
      variableName: 'test',
      attribute: 'body',
      path: '$.test',
      workspaceId: 'wrk_4efc4e7c4dea494ebb4d0280138c8893',
    } as VariableDefinition

    const header = createCustomHeader(variableDefinition)
    const parsed = parseCustomHeader(header)
    const isCustom = isCustomHeader(header)

    expect(parsed).toEqual(variableDefinition)
    expect(isCustom).toEqual(true)
  })

  it('should create and parse custom header with dashes in it', () => {
    const variableDefinition = {
      variableName: 'my-test-variable',
      attribute: 'header',
      path: '$.test-key',
      workspaceId: 'wrk_4efc4e7c4dea4-94ebb4d02-80138c8893',
    } as VariableDefinition

    const header = createCustomHeader(variableDefinition)
    const parsed = parseCustomHeader(header)
    const isCustom = isCustomHeader(header)

    expect(parsed).toEqual(variableDefinition)
    expect(isCustom).toEqual(true)
  })

  it('should not consider ordinary headers to be custom headers', () => {
    expect(isCustomHeader('Authorization')).toEqual(false)
    expect(isCustomHeader('Content-Type')).toEqual(false)
  })
})
