const express = require('express');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Codex Cloud',
    message: 'Your Node.js app with EJS views is ready.'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
