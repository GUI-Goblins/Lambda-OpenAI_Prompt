'use strict';
const { handler } = require('./prompt');
const OpenAI = require('openai');

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'mocked response',
                },
              },
            ],
          }),
        },
      },
    };
  });
});

describe('Lambda function', () => {
  it('should return the expected response', async () => {
    const event = {
      user: {
        name: 'Test',
        age: 30,
        race: 'Human',
        class: 'Warrior',
      },
    };
    const response = await handler(event);
    expect(response).toBe('mocked response');
  });
});

//test written with help from ChatGPT