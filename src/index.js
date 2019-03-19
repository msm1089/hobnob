import '@babel/polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import elasticsearch from 'elasticsearch';
import checkEmptyPayload from './middlewares/check-empty-payload';
import checkContentTypeIsSet from './middlewares/check-content-type-is-set';
import checkContentTypeIsJson from './middlewares/check-content-type-is-json';
import errorHandler from './middlewares/error-handler';
import injectHandlerDependencies from './utils/inject-handler-dependencies';
import ValidationError from './validators/errors/validation-error';
import createUserHandler from './handlers/users/create';
import createUserEngine from './engines/users/create';

const handlerToEngineMap = new Map([[createUserHandler, createUserEngine]]);

const app = express();

const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_PROTOCOL}://${process.env.ELASTICSEARCH_HOSTNAME}:${
    process.env.ELASTICSEARCH_PORT
  }`
});

app.use(checkEmptyPayload);
app.use(checkContentTypeIsSet);
app.use(checkContentTypeIsJson);
app.use(bodyParser.json({ limit: 1e6 }));
app.use(errorHandler);

app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Hobnob API server listening on port ${process.env.SERVER_PORT}!`);
});

app.post(
  '/users',
  injectHandlerDependencies(createUserHandler, client, handlerToEngineMap, ValidationError)
);
