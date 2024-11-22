let express = require('express');
let app = express();

let path = require('path');

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));      // lets you access the body of the request

const knex = require('knex') ({
    client : 'pg',
    connection : {
        host : process.env.RDS_HOSTNAME || 'localhost',
        user : process.env.RDS_USERNAME || 'postgres',
        password : process.env.RDS_PASSWORD || 'Pinacolada17',
        database : process.env.RDS_DB_NAME || 'assignment3',
        port : process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }
})

// Route to display Pokemon records
app.get('/', (req, res) => {
    knex('pokemon')
      .join('poke_type', 'pokemon.poke_type_id', '=', 'poke_type.id')
      .select(
        'pokemon.id',
        'pokemon.description',
        'pokemon.base_total',
        'pokemon.date_created',
        'pokemon.active_poke',
        'pokemon.gender',
        'pokemon.poke_type_id',
        'poke_type.description as poke_type_description'
      )
      .then(pokemon => {
        // Render the index.ejs template and pass the data
        res.render('index', { pokemon });
      })
      .catch(error => {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  app.get('/editPoke/:id', (req, res) => {
    let id = req.params.id;
    // Query the Pokémon by ID first
    knex('pokemon')
      .where('id', id)
      .first()
      .then(pokemon => {
        if (!pokemon) {
          return res.status(404).send('Pokémon not found');
        }
        // Query all Pokémon types after fetching the Pokémon
        knex('poke_type')
          .select('id', 'description')
          .then(poke_types => {
            // Render the edit form and pass both pokemon and poke_types
            res.render('editPoke', { pokemon, poke_types });
          })
          .catch(error => {
            console.error('Error fetching Pokémon types:', error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch(error => {
        console.error('Error fetching Pokémon for editing:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  app.post('/editPoke/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    const description = req.body.description;
    const base_total = parseInt(req.body.base_total); // Convert to integer
    const date_created = req.body.date_created;
    // Since active_poke is a checkbox, its value is only sent when the checkbox is checked.
    // If it is unchecked, no value is sent to the server.
    // This behavior requires special handling on the server-side to set a default
    // value for active_poke when it is not present in req.body.
    const active_poke = req.body.active_poke === 'true'; // Convert checkbox value to boolean
    const gender = req.body.gender;
    const poke_type_id = parseInt(req.body.poke_type_id); // Convert to integer
    // Update the Pokémon in the database
    knex('pokemon')
      .where('id', id)
      .update({
        description: description,
        base_total: base_total,
        date_created: date_created,
        active_poke: active_poke,
        gender: gender,
        poke_type_id: poke_type_id,
      })
      .then(() => {
        res.redirect('/'); // Redirect to the list of Pokémon after saving
      })
      .catch(error => {
        console.error('Error updating Pokémon:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  app.post('/deletePoke/:id', (req, res) => {
    const id = req.params.id;
    knex('pokemon')
      .where('id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/'); // Redirect to the Pokémon list after deletion
      })
      .catch(error => {
        console.error('Error deleting Pokémon:', error);
        res.status(500).send('Internal Server Error');
      });
  });

app.listen(port, () => console.log(`listening on ${port}!!`))