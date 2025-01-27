import { createCustomHeader } from '../custom-header-format/custom-header-format'
import { VariableDefinition } from '../custom-header-format/variable-definition'
import { createMockHeaders } from '../insomnia/mocks/headers-mock'
import { createMockStore } from '../insomnia/mocks/store-mock'
import { RequestContextHeaders, RequestContext } from '../insomnia/types/request-context'
import { RequestHookContext } from '../insomnia/types/request-hook-context'
import { variableDeclarationHeaderRequestHook } from './request-hook'

describe('Variable Declaration Header Request Hook', () => {
  const store = createMockStore()
  let headers: RequestContextHeaders
  let context: RequestHookContext

  beforeEach(() => {
    headers = createMockHeaders()
    context = ({
      request: ({
        ...headers,
      } as Partial<RequestContext>) as RequestContext,
      store,
    } as Partial<RequestHookContext>) as RequestHookContext
  })

  it('should remove the custom header from the request when it is present', async () => {
    const variableDefinition: VariableDefinition = {
      variableName: 'myVar',
      attribute: 'body',
      path: '$.id',
      workspaceId: 'wrk_213653457',
    }
    const headerName = createCustomHeader(variableDefinition)
    headers.setHeader(headerName, 'doesNotMatter')

    await variableDeclarationHeaderRequestHook(context)

    expect(headers.getHeaders()).toEqual([])
  })

  it('should not remove the custom header from the request if it is not present', async () => {
    headers.setHeader('Content-Type', 'application/json')

    await variableDeclarationHeaderRequestHook(context)

    expect(headers.getHeaders()).toEqual([{ name: 'Content-Type', value: 'application/json' }])
  })

  it('should save the custom header value for the response hook to read later', async () => {
    const variableDefinition: VariableDefinition = {
      workspaceId: 'wrk_123567456',
      variableName: 'myVar',
      attribute: 'body',
      path: '$.id',
    }
    const headerName = createCustomHeader(variableDefinition)
    headers.setHeader(headerName, 'doesNotMatter')

    await variableDeclarationHeaderRequestHook(context)

    expect(await store.getItem('variableDefinitions')).toEqual(JSON.stringify([variableDefinition]))
  })
})
