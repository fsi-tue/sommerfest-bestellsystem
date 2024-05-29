import { app, app_port } from './server';

app.listen(app_port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${app_port}`);
    /* eslint-enable no-console */
});