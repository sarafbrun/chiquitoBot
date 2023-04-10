const express = require('express');
const axios = require('axios').default;
const { Telegraf } = require('telegraf');
//me traigo una clase, para crear un objeto
const { Configuration, OpenAIApi } = require('openai');
const { chatGPT } = require('./utils');

//Config .env -> esto lee el fichero de entorno y lo carga
require('dotenv').config();

const app = express();
// esta app nos permite crear rutas, middlewares, alrededor de un servidor web
const bot = new Telegraf(process.env.BOT_TOKEN)

// config Telegraf
//dentro del () ponemos la webkook, un gancho contra una app, un servidor, etc es la url q le doy para que mande las cosas
app.use(bot.webhookCallback('/telegram-bot'));
bot.telegram.setWebhook(`${process.env.BOT_URL}/telegram-bot`);

//para crear una url tipo post sobre mi app entre la creacion y poner a escuchar (es un soporte que necesita telegram para escuchar):
app.post('/telegram-bot'), (req, res) => {
    res.send('Hola Bot');
}

//COMANDOS
bot.command('test', (ctx) => {
    console.log(ctx.message);
    ctx.reply('FUNSIONAAAAA!!!');
});

/* 
OPCION CON LIBRERIA AXIOS:

bot.command('tiempo', async ctx => {
    //return
    const ciudad = ctx.message.text.substring(7).trim();
    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OWM_API_KEY}&units=metric`);
    //console.log(data);
    const {
        main: { temp, temp_min, temp_max, humidity },
        coord: { lon, lat }
    } = data;

    ctx.reply(`Los datos de temperatura en ${ciudad}:
    Temperatura actual: ${temp}º
    Temperatura máxima ${temp_max}º
    Temperatura mínima: ${temp_min}º
    Humedad: ${humidity}º`);
    ctx.replyWithLocation(lat, lon);
}) */

//OPCION CON FETCH: ventaja->  no tener que instalar ninguna libreria

bot.command('tiempo', async ctx => {
    //return
    const ciudad = ctx.message.text.substring(7).trim();

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OWM_API_KEY}&units=metric`);
    const data = await response.json();

    const {
        main: { temp, temp_min, temp_max, humidity },
        coord: { lon, lat }
    } = data;

    ctx.reply(`Los datos de temperatura en ${ciudad}:
    Temperatura actual: ${temp}º
    Temperatura máxima ${temp_max}º
    Temperatura mínima: ${temp_min}º
    Humedad: ${humidity}º`);
    ctx.replyWithLocation(lat, lon);
})

bot.command('receta', async ctx => {
    try {
        //   /receta huevos, aguacate, chorizo
        const ingredientes = ctx.message.text.substring(7).trim();

        const titulo = await chatGPT(`Dame el título de una receta que pueda cocinar con los siguientes ingredientes: ${ingredientes}`);

        const elaboracion = await chatGPT(`Dame la elaboración para la receta con este título: ${titulo}`);

        ctx.reply(titulo);
        ctx.reply(elaboracion);
    } catch (error) {
        ctx.reply('No puedo responderte en estos momentos. Inténtalo más tarde.')
    }
})


bot.on('message', async ctx => {
    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        });
        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
                { role: 'assistant', content: 'Eres un bot de telegram. Tu nombre es @babyBot. Toda respuesta debes contestar como si fueras Chiquito de la calzada' },
                { role: 'user', content: `Respóndeme en menos de 100 caracteres al siguiente texto ${ctx.message.text}` }
            ]
        });

        ctx.reply(completion.data.choices[0].message.content)
    } catch (error) {
        ctx.reply('No puedo responderte en estos momentos. Inténtalo más tarde.')
    }
    //descargamos openai (npm install openai)
});

//ponemos el servidor a escuchar con un puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`)
})
