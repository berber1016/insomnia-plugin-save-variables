import { createCustomHeader } from './custom-header-format/custom-header-format'
import { VariableDefinition } from './custom-header-format/variable-definition'
import { createMockHeaders } from './insomnia/mocks/headers-mock'
import { createMockStore } from './insomnia/mocks/store-mock'
import { RequestHookContext } from './insomnia/types/request-hook-context'
import { ResponseHookContext } from './insomnia/types/response-hook-context'
import { TemplateRunContext } from './insomnia/types/template-context'
import { variableDeclarationHeaderRequestHook } from './request-hook/request-hook'
import { variableSavingResponseHook } from './response-hook/response-hook'
import { savedVariableTemplateTag } from './variable-template-tag/variable-template-tag'

jest.mock('sweetalert', () => ({}))

describe('Test through entire system', () => {
  it('should save variable using request header and response hook', async () => {
    const ticketNumber = 'ID-123'
    const workspaceId = 'wrk_23232323'
    const context = {
      request: createMockHeaders(),
      response: {
        getBody: jest.fn().mockReturnValue(`{"ticket": "${ticketNumber}","other":"doesNotMatter"}`),
      },
      store: createMockStore(),
      meta: {
        workspaceId,
      },
    }
    const variableDefinition: VariableDefinition = {
      variableName: 'ticketNumber',
      attribute: 'body',
      path: '$.ticket',
      workspaceId,
    }
    context.request.setHeader(createCustomHeader(variableDefinition), 'doesNotMatter')

    await variableDeclarationHeaderRequestHook((context as unknown) as RequestHookContext)
    await variableSavingResponseHook((context as unknown) as ResponseHookContext)
    const result = await savedVariableTemplateTag.run((context as unknown) as TemplateRunContext, 'ticketNumber')

    expect(result).toEqual(ticketNumber)
  })

  it('should not be able to access variable that was saved in a different workspace', async () => {
    const ticketNumber = 'ID-123'
    const workspaceId = 'wrk_23232323'
    const context = {
      request: createMockHeaders(),
      response: {
        getBody: jest.fn().mockReturnValue(`{"ticket": "${ticketNumber}","other":"doesNotMatter"}`),
      },
      store: createMockStore(),
      meta: {
        workspaceId,
      },
    }
    const variableDefinition: VariableDefinition = {
      variableName: 'ticketNumber',
      attribute: 'body',
      path: '$.ticket',
      workspaceId,
    }
    context.request.setHeader(createCustomHeader(variableDefinition), 'doesNotMatter')
    const otherWorkspaceContext = {
      ...context,
      meta: {
        workspaceId: 'wrk_8989898998',
      },
    }

    await variableDeclarationHeaderRequestHook((context as unknown) as RequestHookContext)
    await variableSavingResponseHook((context as unknown) as ResponseHookContext)
    const result = await savedVariableTemplateTag.run(
      (otherWorkspaceContext as unknown) as TemplateRunContext,
      'ticketNumber',
    )

    expect(result).toEqual('No variable with name "ticketNumber". No variables have been set yet.')
  })
})
