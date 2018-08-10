// const app = require("express")();
const express = require("express");
const app = express();
const config = require("./config/development");
const bodyParser = require('body-parser');
const _ = require('lodash');
// const slug = require('slug');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
    console.log(`${req.url} --> ${req.method} --> ${Date.now()}`);
    next();
})

// endpoint = url + method
// http://localhost:8080//technologies/?vacancy=https://www.work.ua/jobs/3271955/" - to get query parametr vacancy, use url "/technologies/" and req.query.vacancy
const TECHNOLOGIES = require("./mock-data/technologies");

// Controller
const getTechnologies = (req, res, next) => {
    const vacancyUrl = req.query.vacancy;
    const webAdressRegExp = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig;
    if (webAdressRegExp.test(vacancyUrl)) {
        JSDOM.fromURL(vacancyUrl).then(dom => {
            const getedDom = dom.window.document.querySelectorAll('p b')[0].parentNode.nextSibling.querySelectorAll('li');
            newDom = [...getedDom];
            const newMap = newDom.map(info => info.innerHTML + ' ');
            const jobInfo = newMap.reduce((acc = '', info) => acc + info);
            const technologiesCategories = Object.keys(TECHNOLOGIES);
            technologiesCategories.forEach(category => TECHNOLOGIES[category] = jobInfo.includes(category));
            req.vacancy = TECHNOLOGIES;
            next();
        });
    }
    else {
        next(err);
    }
};


const sendTechnologies = (req, res, next) => {
    res.status(200);
    res.json(req.vacancy);
};

// Technologies
app.get('/technologies/', getTechnologies, sendTechnologies);


// Not Found Error
app.use((req, res, next) => {
    const error = new Error("Not Found!");
    next(error);
})

// All errors
app.use((err, req, res, next) => {
    res.status(500);
    res.json({
        error: err.message,
        stack: err.stack
    })
})

app.listen(config.port);