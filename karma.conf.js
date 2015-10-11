module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai-as-promised', 'sinon-chai', 'chai'],
    files: [
      'test/chrome_api_stub.js',
      'chromise.js',
      'test/chromise_test.js'
    ],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeCanary'],
    singleRun: false
  });
};
