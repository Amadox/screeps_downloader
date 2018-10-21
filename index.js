#!/usr/bin/env node
const cfg = require('./config.json');
const https = require('https');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const email = cfg.user;
const password = cfg.pass;
const date = new Date();
const lpad = (str, len, ch) => {
    str = `${str}`;
    while (str.length < len) {
        str = `${ch}${str}`;
    }
    return str;
};

const dateString = `${lpad(date.getFullYear(), 4, 0)}-${lpad(date.getMonth()+1, 2, 0)}-${lpad(date.getDate(), 2, 0)}`;
const timeString = `${lpad(date.getHours(), 2, 0)}-${lpad(date.getMinutes(), 2, 0)}-${lpad(date.getSeconds(), 2, 0)}`;

const req = https.request({
    hostname: 'screeps.com',
    port: 443,
    path: '/api/user/code',
    auth: email + ':' + password,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}, (res) => {
    // console.log('statusCode:', res.statusCode);
    // console.log('headers:', res.headers);

    let body = [];
    res.on('data', (d) => {
        body.push(d);
    });

    res.on('end', () => {
        const data = JSON.parse(Buffer.concat(body).toString());
        const path = `./downloads/${data.branch}_${dateString}_${timeString}`;

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        let cnt = 0;
        for(let moduleName in data.modules) {
            if (data.modules.hasOwnProperty(moduleName)) {
                const code = data.modules[moduleName];
                const fileName = `${moduleName}.js`;
                cnt++;

                console.log(`saving ${fileName}...`);

                fs.writeFileSync(`${path}/${fileName}`, code, 'utf8');
            }
        }

        console.log(`saved ${cnt} downloaded files to ${path}/`);
    });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
