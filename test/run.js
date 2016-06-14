global.fetch = require('node-fetch');

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const Client =  require('../dist/client/api');
const urls = require('../dist/app/config/server').urls;

const testsFolder = path.resolve(__dirname, 'tests');
const endpoint = urls.root + urls.root_path;

function seed() {
  return new Promise((resolve, reject) => {
    exec('nippy -s seed/testing', function(error, stdout, stderr) {
      if (error) {
        console.error('Error while seeding database', error)
        return reject(error);
      }
      resolve(true);
    });
  })
}

const client = new Client({ endpoint });
fs.readdirSync(testsFolder).forEach((file) => require(`${testsFolder}/${file}`)(client, seed));
