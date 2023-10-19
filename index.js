'use strict';

require('dotenv').config();
const AWS = require('aws-sdk');
// const OpenAI = require('openai');
// const openai = new OpenAI(process.env.OPENAI_API_KEY);
// const OPEN_AI_URL = process.env.OPEN_AI_URL;
const axios = require('axios');
const OPEN_AI_URL = process.env.OPEN_AI_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const lambda = new AWS.Lambda();

exports.handler = async (event) => {
  //console log for making sure event is being picked up
  console.log('We hit the event!', event);
  const requestBody = event.body;
  const user = event.user;
  const { scene, userChoice } = requestBody;

  const header = {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (!requestBody.roll) {
    const data = {
      messages: [
        {
          role: 'user',
          content: `An adventurer named ${user.name}, a ${user.age}-year-old ${user.race} ${user.class}, in a previous scene of ${scene}. After this scene, ${user.name} ${userChoice}. Your response will in a JSON object with the following properties. First, user object with properties name, age, race, class. Second, string named 'scene' that explains what happens next in 2 or 3 sentences. Third, array named 'options' that generates 4 options/elements in 4 words or less where each option is an action that user can choose next.`,
        },
      ],
      model: 'gpt-3.5-turbo',
    };
    console.log('Here is our data:', data);
    try {
      const openAiResponse = await axios.post(
        OPEN_AI_URL,
        data,
        header
      );
      const openAi = openAiResponse.data.choices[0].message.content;
      console.log('Here is our open ai response before being parsed:', openAi);
      const params = {
        FunctionName: 'characterRoll',
        InvocationType: 'Event',
        Payload: JSON.stringify(openAi),
      };

      const response = await lambda.invoke(params).promise();
      console.log("HERES THE RESPONSE FROM CHAR ROLL", response.body);

      if (response.FunctionError) {
        throw new Error(`Lambda invocation error: ${response.FunctionError}`);
      }
    } catch (error) {
      //console log for showing the error
      console.error('Encountered error with prompt request to OpenAI', error);
    }
  } else {
    const data = {
      messages: [
        {
          role: 'user',
          content: `Your response will in a JSON object with the following properties. First, user object with properties ${user.name}, ${user.age}, ${user.race}, and ${user.class}. Second, string named 'deathScene' that explains how the user dies based on the scene, ${scene}, and based on ${user.name}'s actions, ${userChoice}. This deathScene will be at most 2 sentences.`,
        },
      ],
      model: 'gpt-3.5-turbo',
    };
    console.log('Here is our data:', data);
    try {
      const openAiResponse = await axios.post(OPEN_AI_URL, data, header);
      const openAi = openAiResponse.data.choices[0].message.content;
      console.log('Here is our open ai response before being parsed:', openAi);
      const responseData = JSON.parse(openAi);
      console.log('Here is our open ai response:', responseData);

      // return responseData;

      const params = {
        FunctionName: 'characterRoll',
        InvocationType: 'Event',
        Payload: JSON.stringify(responseData),
      };

      const response = await lambda.invoke(params).promise();
      console.log('HERES THE RESPONSE FROM CHAR ROLL', response.body);

      if (response.FunctionError) {
        throw new Error(`Lambda invocation error: ${response.FunctionError}`);
      }
    } catch (error) {
      //console log for showing the error
      console.error('Encountered error with prompt request to OpenAI', error);
    }
  }
};
