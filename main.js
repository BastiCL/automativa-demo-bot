/* eslint-disable arrow-body-style */
const debug = require('debug')('bot-main');
const login = require('./src/process/login');
require('dotenv').config();

/**
 * Env variables
 */

const { SSI_URL, SSI_RUT, SSI_PASS } = process.env;

/**
 * Main fn
 *
 * @returns Promise
 */

const main = () => {
  return Promise.resolve()
    .then(() => debug('*** Inicia proceso TEST-AUTOMATIVA ***'))
    .then(() => Promise.all([login(SSI_URL, SSI_RUT, SSI_PASS)]))
    .then(() => {
      debug('*** Proceso finaliza exitosamente ***');
      process.exit(0);
    })
    .catch((error) => {
      debug('*** Termina proceso con error: %o ***', error);
      process.exit(1);
    });
};

main();
