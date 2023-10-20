# Postman to swagger

![coverage](./shields/coverage.svg)

We like to use postman, but often we get asked for swagger docs. There doesn't seem to be any open source postman `v2.0.0` => swagger/openApi tools. Maybe a commercial reason, here is one for you.

## Usage

```js
import postmanToSwagger from 'postman-to-swagger';

const convertAndSave = postmanJson => {
  // This returns the actual swagger v2.0 spec as a json
  const swaggerJson = postmanToSwagger(postmanJson);

  // Example if you want to save it somewhere
  fs.writeFile(
    '../_docs/swagger.json',
    JSON.stringify(swaggerJson, null, 2),
    'utf8'
  );
};
```

With `swagger-ui-express`

```js
import postmanToSwagger from 'postman-to-swagger';
import swaggerUi from 'swagger-ui-express';
import mockCollection from './mockCollection.json';

swagger.get('/swagger', swaggerUi.setup(postmanToSwagger(mockCollection)));
// Static stuff
swagger.use('/', swaggerUi.serve, (req, res) => res.status(404).end());
```

## What it converts

- name, description, version
- routes, folders
- examples, status codes

## Demo

```bash
# Build this lib
npm run build
# Go into demo folder and install
npm install
# Then run the demo
npm run watch
```

## Future improvement

- Apimatic has this `models` thing that is kind of useful, maybe we can also do that.
- Use `lodash/fp`, `lodash/fp/flow` to slim down module size

## Repos to watch

- [api-flow](https://github.com/luckymarmot/API-Flow) - broken, but maybe inspiring.
- [postman2swagger2](https://github.com/IntegrateDev/postman2swagger2/blob/master/index.js) - Doesn't support postman v2
