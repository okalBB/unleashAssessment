/**
 * 300-char summary: This service module handles CRUD operations for point-cloud annotations in a serverless environment. 
 * It provides functions to retrieve, create, update, and delete annotations scoped by modelId. Uses DynamoDB for production, in-memory for testing.
 * Supports async operations with proper error handling for not-found cases. Designed for AWS Lambda integration with API Gateway.
 */

import { Annotation } from '../types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
const { v4: uuid } = require('uuid');

// Configure AWS SDK v3 - lazy initialization
let client: DynamoDBClient | null = null;
let dynamodb: DynamoDBDocumentClient | null = null;

function getDynamoDB() {
  if (!dynamodb) {
    client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
    dynamodb = DynamoDBDocumentClient.from(client);
  }
  return dynamodb;
}

const TABLE_NAME = process.env.ANNOTATIONS_TABLE;

// In-memory storage for annotations, keyed by modelId (for testing)
const annotations: { [modelId: string]: Annotation[] } = {};

// Resets the in-memory storage (for testing purposes)
export function resetAnnotations(): void {
  for (const key in annotations) {
    delete annotations[key];
  }
}

// Retrieves all annotations for a given modelId
export async function getAll(modelId: string): Promise<Annotation[]> {
  if (!TABLE_NAME) {
    return annotations[modelId] || [];
  }
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'modelId = :modelId',
    ExpressionAttributeValues: {
      ':modelId': modelId,
    },
  };
  const result = await getDynamoDB().send(new QueryCommand(params));
  return result.Items as Annotation[];
}

// Creates a new annotation for the specified modelId
export async function createOne(modelId: string, data: Omit<Annotation, 'id'>): Promise<Annotation> {
  if (!TABLE_NAME) {
    if (!annotations[modelId]) {
      annotations[modelId] = [];
    }
    const newAnnotation: Annotation = { id: uuid(), modelId, ...data };
    annotations[modelId].push(newAnnotation);
    return newAnnotation;
  }
  const newAnnotation: Annotation = { id: uuid(), modelId, ...data };
  const params = {
    TableName: TABLE_NAME,
    Item: newAnnotation,
  };
  await getDynamoDB().send(new PutCommand(params));
  return newAnnotation;
}

// Updates an existing annotation by id within the modelId scope
export async function updateOne(modelId: string, id: string, data: Partial<Annotation>): Promise<Annotation> {
  if (!TABLE_NAME) {
    const list = annotations[modelId] || [];
    const index = list.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Annotation not found');
    }
    list[index] = { ...list[index], ...data };
    return list[index];
  }
  // First, get the current item
  const getParams = {
    TableName: TABLE_NAME,
    Key: { modelId, id },
  };
  const currentItem = await dynamodb.send(new GetCommand(getParams));
  if (!currentItem.Item) {
    throw new Error('Annotation not found');
  }
  const updatedAnnotation = { ...currentItem.Item, ...data };
  const updateParams = {
    TableName: TABLE_NAME,
    Key: { modelId, id },
    UpdateExpression: 'SET ' + Object.keys(data).map(key => `${key} = :${key}`).join(', '),
    ExpressionAttributeValues: Object.keys(data).reduce((acc, key) => ({ ...acc, [`:${key}`]: data[key as keyof Annotation] }), {}),
    ReturnValues: 'ALL_NEW' as const,
  };
  const result = await dynamodb.send(new UpdateCommand(updateParams));
  return result.Attributes as Annotation;
}

// Deletes an annotation by id within the modelId scope
export async function deleteOne(modelId: string, id: string): Promise<void> {
  if (!TABLE_NAME) {
    const list = annotations[modelId] || [];
    const index = list.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Annotation not found');
    }
    list.splice(index, 1);
    return;
  }
  const params = {
    TableName: TABLE_NAME,
    Key: { modelId, id },
  };
  await getDynamoDB().send(new DeleteCommand(params));
}