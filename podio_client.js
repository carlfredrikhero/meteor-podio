Podio = {};

// Request Podio credentials for the user
//
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Podio.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'podio'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  var credentialToken = Random.secret();

  var loginStyle = OAuth._loginStyle('podio', config, options);

  var loginUrl =
        'https://podio.com/oauth/authorize?client_id=' + config.appId +
        '&redirect_uri=' + OAuth._redirectUri('podio', config) +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken);

  OAuth.launchLogin({
    loginService: "podio",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken
  });
};