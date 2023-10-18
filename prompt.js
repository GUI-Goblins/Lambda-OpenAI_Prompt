'use strict';

const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

const AWS = require('aws-sdk');
// const OPEN_AI_URL = process.env.OPEN_AI_URL;


exports.handler = async (event) => {
    //console log for making sure event is being picked up
    console.log("We hit the event!", event);
    const user = event.user;

    const data = {
        messages: [
            {
                role: "user",
                content: `An adventurer named ${user.name}, a ${user.age}-year-old ${user.race} ${user.class}, enters a tavern. Respond with a concise, detailed explanation of what happens once they enter the tavern. Then, using a 50/50 chance, determine if the user will receive 2 options (true or false) in order to continue the story, or generate 4 options where each option to continue the story contains a 4% chance of failure resulting in character death. If the character dies, provide an expalanation based on the option previously chosen.`
            }
        ],
        model: "gpt-3.5-turbo",
    };

    //checking to make sure we return data
    console.log("Here is our data:", data);

    try {
        const response = await openai.chat.completions.create(data);
        const responseData = response.choices[0].message.content;

        return responseData;
    } catch (error) {
        //console log for showing the error
        console.error("ruh roh", error);
    }
};