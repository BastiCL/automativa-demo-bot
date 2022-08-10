const debug = require('debug')('bot-login');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Module
 * @returns Promise
 */

module.exports = async (url, rut, pass) => {
  const browser = await puppeteer.launch({ headless: true });
  const [page] = await browser.pages();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(30000);

  const delay = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));
  const waitForNav = () => page.waitForNavigation({
    waitUntil: ['networkidle0'],
  });

  return new Promise((resolve, reject) => {
    page.goto(url)
      .then(() => page.on('popup', () => {
        reject(new Error('Alert message in browser')); // Handle this with controlled retry
      }))
      .then(() => page.on('dialog', () => {
        reject(new Error('Alert message in browser')); // Handle this with controlled retry
      }))
      .then(() => debug('Ingresa SSI'))
      .then(() => page.$x('//*[@id="sinAutenticacion"]/li/a'))
      .then(([btn]) => btn.click())
      .then(() => debug('Navega ingreso credenciales'))
      .then(() => page.waitForXPath('//*[@id="rutcntr"]'))
      .then(() => page.$x('//*[@id="rutcntr"]'))
      .then(([input]) => input.type(rut))
      .then(() => page.$x('//*[@id="clave"]'))
      .then(([input]) => input.type(pass))
      .then(() => page.$x('//*[@id="bt_ingresar"]'))
      .then(([btn]) => btn.click())
      .then(() => debug('Intenta loguear'))
      .then(() => Promise.allSettled([page.waitForXPath('//*[@id="titulo"]', { timeout: 3000 })]))
      .then(([results]) => {
        if (results.status === 'fulfilled') {
          throw new Error('Contraseña incorrecta');
        }
      })
      .then(() => Promise.allSettled([page.waitForXPath('//*[@id="alert_placeholder"]/div', { timeout: 2000 })]))
      .then(([results]) => {
        if (results.status === 'fulfilled') {
          throw new Error('Credenciales incorrectas');
        }
      })
      .then(() => page.waitForXPath('//*[@id="info_profile"]'))
      .then(() => debug('Login exitoso'))
      .then(() => page.hover('#main-menu > li.dropdown > a'))
      .then(() => page.$x('//*[@id="main-menu"]/li[2]/ul/li[8]/a'))
      .then(([btn]) => btn.click())
      .then(waitForNav)
      .then(() => debug('Ingresa emisor boletas honorarios'))
      .then(() => page.$x('//*[@id="my-wrapper"]/div[*]/div/div/div[2]/p[3]/a'))
      .then(([btn]) => btn.click())
      .then(waitForNav)
      .then(() => Promise.allSettled([page.waitForXPath('//*[@id="modalInforma"]/div/div/div[3]/button', { timeout: 10000 })]))
      .then(([results]) => {
        if (results.status === 'fulfilled') {
          page.$x('//*[@id="modalInforma"]/div/div/div[3]/button')
            .then(([btn]) => btn.click())
            .then(() => debug('Cierra modal'));
        }
      })
      .then(() => delay(1000))
      .then(() => page.$x('//*[@id="headingOne"]/h4/a'))
      .then(([btn]) => btn.click())
      .then(() => debug('Emitir boletas honorarios'))
      .then(() => delay(2000))
      .then(() => page.$x('//*[@id="collapseOne"]/div/div/ul/li[2]/a'))
      .then(([btn]) => btn.click())
      .then(() => debug('Emitir por contribuyente con datos usados anteriormente'))
      .then(waitForNav)
      .then(() => page.$x('/html/body/div/center/table[2]/tbody/tr[5]/td/div/center/form/table/tbody/tr[4]/td/ul/li[3]/a'))
      .then(([btn]) => btn.click())
      .then(() => debug('Basarse en última boleta emitida'))
      .then(waitForNav)
      .then(() => page.close())
      .then(() => browser.close())
      .then(() => resolve('Loggueado'))
      .catch((error) => {
        page.screenshot({
          path: `${path.resolve('src/screenshots/')}/exception_${Date.now()}.jpg`,
          type: 'jpeg',
          fullPage: true,
        })
          .then(() => page.close())
          .then(() => browser.close())
          .then(() => reject(error));
      });
  });
};
