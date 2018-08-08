const app = require('./app');
const logicModule = require('./api/logic');
const modelsModule = require('./api/models');

const resources = {};
resources.models = modelsModule.init(resources);
resources.logic = logicModule.init(resources);

app.start(resources);
