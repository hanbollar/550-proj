# Instructions

## Connecting to a Database

To connect to a database, add a file to the project's root directory named ``db-config.js`` and give it the following text (filling in the fields with the database's info):

```
module.exports = {
	user: 'insert-user-name',
	password: 'insert-password',
	host: 'insert-host-name',
	port: insert-port-number,
	database: 'insert-database-name'
};
```

## Testing the Data Routes

There are placeholder functions in ``common.js`` that can test the app's SQL routes. To run them, follow these steps:
1. Start the server using ``npm start`` or ``npm run devstart``
2. Go to ``http://localhost:3000/`` in a web browser
3. Open the browser's console
4. Type any of the following into the console and press Enter:
	1. getCountryTuples()
	2. getIndicatorTuples()
	3. getCardTuples()
	4. getGraphTuples()
	5. getYoyTuples()
	6. getYoyPairTuples()
	7. getCompletenessTuples()
