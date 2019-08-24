const express = require('express'); // This module help use to handle http req
const expressGraphQL = require('express-graphql'); // This module use make bridge between express and graphql
const schema = require('./schema/schema'); // This our entire graphql schema

const app = express(); // make express app

// when any http request having 'graphql' in req it will execute
// provided bridge information like schema and graphiql
app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}));

// start server on port 8080
app.listen(8080, () => {
    console.log('Server start on port 8080');
});