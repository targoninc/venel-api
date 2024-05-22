export const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Venel API',
            version: '1.0.0',
            description: 'Venel is a chat application that allows users to chat with each other. It also allows cross instance messaging.',
        },
    },
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'connect.sid',
            }
        }
    },
    apis: ['./routes/*.js'],
};