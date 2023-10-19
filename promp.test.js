'use strict';
const { handler } = require('./index');
const axios = require('axios');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

jest.mock('axios');
jest.mock('@aws-sdk/client-lambda', () => {
  const mLambda = { send: jest.fn() };
  return {
    LambdaClient: jest.fn(() => mLambda),
    InvokeCommand: jest.fn(),
  };
});

describe('Lambda function', () => {
  let lambda;
  beforeEach(() => {
    lambda = new LambdaClient();
  });

  it('should return the expected response when roll is not present or includesKeyword is true', async () => {
    const event = {
      user: {
        name: 'Test',
        age: 30,
        race: 'Human',
        class: 'Warrior',
      },
      body: {
        scene: 'Test Scene',
        userChoice: 'help',
        roll: null,
      },
    };

    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'mocked response',
            },
          },
        ],
      },
    });

    lambda.send.mockResolvedValue({
      Payload: Buffer.from(JSON.stringify('mocked lambda response')),
    });

    const response = await handler(event);
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify('mocked lambda response'),
    });
  });

  it('should return the expected response when roll is present and includesKeyword is false', async () => {
    const event = {
      user: {
        name: 'Test',
        age: 30,
        race: 'Human',
        class: 'Warrior',
      },
      body: {
        scene: 'Test Scene',
        userChoice: 'fight',
        roll: '20',
      },
    };

    axios.post.mockResolvedValue({
      data: {
        choices: [
          {
            message: {
              content: 'mocked response',
            },
          },
        ],
      },
    });

    lambda.send.mockResolvedValue({
      Payload: Buffer.from(JSON.stringify('mocked lambda response')),
    });

    const response = await handler(event);
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify('mocked lambda response'),
    });
  });
});

//test written with help from ChatGPT