import { app, appPort } from './server';

app.listen(appPort, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${appPort}`);
    /* eslint-enable no-console */
});
