Package.describe({
  name: 'carlfredrikhero:podio',
  summary: ' Podio OAuth flow ',
  version: '1.0.0',
  git: 'https://github.com/carlfredrikhero/meteor-podio.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('templating', 'client');
  api.use('underscore', 'server');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Podio');

  api.add_files(
    ['podio_configure.html', 'podio_configure.js'],
    'client');

  api.addFiles('podio_server.js', 'server');
  api.addFiles('podio_client.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('carlfredrikhero:podio');
  api.addFiles('podio-tests.js');
});
