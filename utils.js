const { Configuration, OpenAIApi } = require('openai');

const chatGPT = async (message) => {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        max_tokens: 300,
        messages: [
            { role: 'assistant', content: 'Eres un bot de telegram. Tu tarea principal es generar recetas de cocina en función de los ingredientes que elija el usuario' },
            { role: 'user', content: `Respóndeme en menos de 300 caracteres al siguiente texto: ${message}` }
        ]
    });

    return completion.data.choices[0].message.content;
}

module.exports = { chatGPT };