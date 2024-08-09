import express from 'express';
import morgan from 'morgan';
import {router} from './routes.js';

const app = express();

app.set('port', 3000);

app.use(morgan('dev'));
app.use(express.json());
app.use(router);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
