exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      // 'mongodb://localhost/open-toolbox';
                      'mongodb://ross:screwdriver@ds141950.mlab.com:41950/open-toolbox';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
                       global.TEST_DATABASE_URL ||
                      'mongodb://localhost/test-open-toolbox';
exports.PORT = process.env.PORT || 8080;
