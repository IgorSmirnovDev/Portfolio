module.exports = function(app, fs, express, config, logger) {
    var firstRun = true;
    var dataModule = require('../server/data.js');
    var helpers = require('../server/helpers.js');
    var actualData;

    // Reloads the data if in dev mode, better for writing new posts!
    var data = function() {
        if (firstRun || config.dev) {
            firstRun = false;

            actualData = dataModule(fs);
        }

        return actualData;
    };

    // Load each controller and run them.
    fs.readdirSync('./server/controllers/').forEach(function(file) {
        require('../server/controllers/' + file)(app, fs, express, config, logger, data, helpers);
    });

    /////////////////
    // Static files
    /////////////////
    app.use(express.static('./public'));

    if (global.dev == true) {
        app.use(express.static('./src'));
    }

    /////////////////
    // Statuses
    /////////////////
    
    // These have to be setup after everything else.

    app.use(function(req, res, next) {
        logger.info('404 error: %s', req.originalUrl);

        res.status(404).render('page', {
            layout: 'common',
            relativeUrl: '404',
            pageGroup: '',
            pageTitle: 'Status: 404',
            bodyText: '<p>You\'re looking for a page that doesn\'t exist...</p>'
        });
    });

    app.use(function(err, req, res, next) {
        logger.error('500 error: %s', err.stack);

        res.status(500).render('page', {
            layout: 'common',
            relativeUrl: '500',
            pageGroup: '',
            pageTitle: 'Status: 500',
            bodyText: '<p>So sorry, but a problem occured! Please email me if this problem persists.</p>'
        });
    });
};

