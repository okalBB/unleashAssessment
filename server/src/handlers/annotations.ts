/**
 * 300-char summary:
 * REST Lambda handler for point-cloud annotations. Routes API Gateway requests
 * to CRUD operations based on HTTP method. Supports list, create, update and
 * delete per modelId. Stateless, simple, and suitable for serverless
 * persistence using DynamoDB.
 */

import { APIGatewayProxyHandler } from 'aws-lambda'
import { v4 as uuid } from 'uuid'
import {getAll,createOne,updateOne,deleteOne} from '../services/annotations.service'

/**
 * Single Lambda entry handling all REST verbs.
 * API Gateway routes map here.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  const { httpMethod, pathParameters, body } = event

  // modelId scopes annotations to a specific point cloud
  const modelId = pathParameters?.modelId
  const id = pathParameters?.id

  try {
    // GET /models/{modelId}/annotations
    if (httpMethod === 'GET') {
      return {
        statusCode: 200,
        body: JSON.stringify(await getAll(modelId!)),
      }
    }

    // POST /models/{modelId}/annotations
    if (httpMethod === 'POST') {
      const data = JSON.parse(body || '{}')

      return {
        statusCode: 201,
        body: JSON.stringify(
          await createOne(modelId!, {
            id: uuid(), // server-generated ID
            ...data,
          })
        ),
      }
    }

    // PATCH /models/{modelId}/annotations/{id}
    if (httpMethod === 'PATCH') {
      const data = JSON.parse(body || '{}')

      return {
        statusCode: 200,
        body: JSON.stringify(await updateOne(modelId!, id!, data)),
      }
    }

    // DELETE /models/{modelId}/annotations/{id}
    if (httpMethod === 'DELETE') {
      await deleteOne(modelId!, id!)
      return { statusCode: 204, body: '' }
    }

    // Unsupported verb
    return { statusCode: 405, body: 'Method Not Allowed' }
  } catch (err: any) {
    // Centralised error response
    return { statusCode: 500, body: err.message }
  }
}
