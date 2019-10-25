# Instructions

## Connecting to a Database

To connect to a MariaDB database at Penn, add a file to the project's root directory named ``db-config.js`` and give it the following text:

```
module.exports = {
  host: "fling.seas.upenn.edu",
  user: "your-pennkey",
  password: "your-password",
  database: "your-pennkey"
};
```
