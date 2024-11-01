const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = 'AC99dc52f9914bbe8c4d7aa1730296f057';
const authToken = '81e079499f6fd1eb5cf38cb6d739dda4';
const client = new twilio(accountSid, authToken);
const openaiApiKey = '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';

// Trigger word here
const TRIGGER_WORD = "@bot";

// Helper function to get AI-generated response
async function getAIResponse(userMessage) {
  const prompt = `You are a helpful assistant. Respond to: "${userMessage}"`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003', // Use "gpt-4" if you have access to it
        prompt: prompt,
        max_tokens: 50,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Sorry, I am having trouble understanding your request.';
  }
}

// SMS webhook to handle incoming messages
app.post('/sms', async (req, res) => {
  const incomingMessage = req.body.Body;

  // Check if the trigger word is in the message
  if (incomingMessage.toLowerCase().includes(TRIGGER_WORD.toLowerCase())) {
    // Remove the trigger word from the message before passing it to the AI
    const messageWithoutTrigger = incomingMessage.replace(new RegExp(TRIGGER_WORD, "i"), "").trim();
    
    // Get AI-generated response
    const replyMessage = await getAIResponse(messageWithoutTrigger);

    // Send response back to user
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>${replyMessage}</Message>
      </Response>
    `);
  } else {
    // No response if trigger word is not found
    res.set('Content-Type', 'text/xml');
    res.send(`<Response></Response>`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
