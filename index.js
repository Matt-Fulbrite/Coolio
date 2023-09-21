const pg = require('pg');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const client = new pg.Client('postgress://localhost/coolio');
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/digimon', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * FROM digimon;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error)
    }
});

app.get('/api/digimon/:id', async (req, res, next) => {
    try {
        const SQL = `
            SELECT *
            FROM digimon
            WHERE id = $1;
        `
        const response = await client.query(SQL, [req.params.id]);
        if (response.rows.length === 0) {
            throw new Error('ID does not exist');
        }
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/digimon/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE FROM digimon
        WHERE id = $1;
    `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

app.post('/api/digimon', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO digimon(name, type, attack)
            VALUES ($1, $2, $3)
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.attack]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.put('/api/digimon/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE digimon
            SET name = $1, type = $2, attack = $3
            WHERE id = $4
            Returning *
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.attack, req.params.id]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.use('*', (req, res, next) => {
    res.status(404).send('404 Error');
});

app.use((err, req, res, next) => {
    res.status(500).send(err.message);
});

const start = async () => {
    await client.connect();
    console.log('database connected');
    const SQL = `
        DROP TABLE IF EXISTS digimon;
        CREATE TABLE digimon(
            id SERIAL PRIMARY KEY,
            name VARCHAR(25),
            type VARCHAR(25),
            attack VARCHAR(25)
        );
        INSERT INTO digimon (name, type, attack) VALUES ('Agumon', 'Reptile', 'Pepper Breath');
        INSERT INTO digimon (name, type, attack) VALUES ('Greymon', 'Dinosaur', 'Nova Blast');
        INSERT INTO digimon (name, type, attack) VALUES ('MetalGreymon', 'Cyborg', 'Mega Claw');
    `;

    await client.query(SQL);
    

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });

}

start();