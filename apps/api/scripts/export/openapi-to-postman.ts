#!/usr/bin/env tsx

/**
 * Convert OpenAPI specification to Postman Collection v2.1
 *
 * Usage: npx tsx scripts/openapi-to-postman.ts
 * Input: openapi.json
 * Output: postman-collection.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
  };
  auth: {
    type: string;
    bearer: Array<{ key: string; value: string; type: string }>;
  };
  item: Array<any>;
  variable: Array<{ key: string; value: string; type: string }>;
}

function convertOpenAPIToPostman(openapi: any): PostmanCollection {
  const collection: PostmanCollection = {
    info: {
      name: openapi.info.title,
      description: openapi.info.description,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{accessToken}}',
          type: 'string',
        },
      ],
    },
    item: [],
    variable: [
      {
        key: 'baseUrl',
        value: 'http://localhost:3000',
        type: 'string',
      },
      {
        key: 'accessToken',
        value: '',
        type: 'string',
      },
      {
        key: 'refreshToken',
        value: '',
        type: 'string',
      },
    ],
  };

  // Group endpoints by tag
  const tagGroups: { [key: string]: any[] } = {};

  Object.entries(openapi.paths || {}).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, details]: [string, any]) => {
      if (method === 'parameters') return;

      const tag = details.tags?.[0] || 'other';
      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }

      const request: any = {
        name: details.summary || details.description || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json',
              type: 'text',
            },
          ],
          url: {
            raw: `{{baseUrl}}${path}`,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(Boolean),
          },
        },
      };

      // Add request body if exists
      if (details.requestBody?.content?.['application/json']?.schema) {
        const schema = details.requestBody.content['application/json'].schema;
        const example = generateExample(schema);
        request.request.body = {
          mode: 'raw',
          raw: JSON.stringify(example, null, 2),
          options: {
            raw: {
              language: 'json',
            },
          },
        };
      }

      // Add query parameters if exists
      if (details.parameters) {
        const queryParams = details.parameters.filter((p: any) => p.in === 'query');
        if (queryParams.length > 0) {
          request.request.url.query = queryParams.map((p: any) => ({
            key: p.name,
            value: p.example || '',
            description: p.description,
            disabled: !p.required,
          }));
        }
      }

      // Add example response
      if (details.responses?.['200']?.content?.['application/json']?.schema) {
        const schema = details.responses['200'].content['application/json'].schema;
        const example = generateExample(schema);
        request.response = [
          {
            name: 'Success',
            originalRequest: request.request,
            status: 'OK',
            code: 200,
            body: JSON.stringify(example, null, 2),
          },
        ];
      }

      tagGroups[tag].push(request);
    });
  });

  // Convert tag groups to Postman folders
  collection.item = Object.entries(tagGroups).map(([tag, requests]) => ({
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    item: requests,
  }));

  return collection;
}

function generateExample(schema: any): any {
  if (!schema) return {};

  if (schema.example) return schema.example;

  if (schema.type === 'object') {
    const example: any = {};
    Object.entries(schema.properties || {}).forEach(([key, prop]: [string, any]) => {
      example[key] = prop.example || getDefaultValue(prop.type, prop.format);
    });
    return example;
  }

  if (schema.type === 'array') {
    return [generateExample(schema.items)];
  }

  return getDefaultValue(schema.type, schema.format);
}

function getDefaultValue(type: string, format?: string): any {
  if (format === 'email') return 'user@example.com';
  if (format === 'date-time') return new Date().toISOString();
  if (format === 'uuid') return '00000000-0000-0000-0000-000000000000';

  switch (type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 0;
    case 'boolean':
      return false;
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}

async function convert() {
  console.log('Converting OpenAPI to Postman Collection...');

  const inputPath = join(__dirname, '../../openapi.json');
  const outputPath = join(__dirname, '../../postman-collection.json');

  try {
    // Read OpenAPI spec
    const openapi = JSON.parse(readFileSync(inputPath, 'utf-8'));

    // Convert to Postman collection
    const collection = convertOpenAPIToPostman(openapi);

    // Write to file
    writeFileSync(outputPath, JSON.stringify(collection, null, 2));

    console.log(`✅ Postman collection exported to: ${outputPath}`);
    console.log(`📁 Folders: ${collection.item.length}`);
    console.log(`📨 Total requests: ${collection.item.reduce((sum, folder) => sum + folder.item.length, 0)}`);
  } catch (error: any) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

convert();
