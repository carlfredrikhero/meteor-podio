// (name, version, urls, handleOauthRequest)
Podio = {};

var querystring = Npm.require('querystring');


OAuth.registerService('podio', 2, null, function(query) {

  // TODO how does the response look like
//   {
//   "access_token": ACCESS_TOKEN
//   "token_type": "bearer",
//   "expires_in": EXPIRES_IN,
//   "refresh_token": REFRESH_TOKEN,
//   "ref":
//   {
//     "type": "user",
//     "id": USER_ID
//   }
// }
  var response = getTokenResponse(query);
  var accessToken = response.accessToken;
  var identity = getIdentity(accessToken);

  var serviceData = {
    accessToken: accessToken,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

    // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;

  // include all fields from facebook
  // http://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/

  // TODO get user data from Podio
  // user.user_id
  // user.mail
  // user.inbox_new
  // profile.profile_id
  // profile.image.thumbnail_link
  // profile.title[0]
  // profile.name

  var fields = {
  	id: identity.user.user_id,
  	email: identity.user.mail,
  	inbox_new: identity.user.inbox_new,
  	profile_id: identity.profile.profile_id,
  	avatar: identity.profile.image.thumbnail_link,
  	title: identity.profile.title[0],
  	name: identity.profile.name
  };

  _.extend(serviceData, fields);

  return {
    serviceData: serviceData,
    options: { profile: { name: identity.profile.name }  }
  };
});

// checks whether a string parses as JSON
var isJSON = function (str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
var getTokenResponse = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'podio'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var responseContent;
  try {
    // Request an access token
    responseContent = HTTP.post(
      "https://api.podio.com/oauth/token", {
        params: {
          grant_type: 'authorization_code',
          client_id: config.appId,
          redirect_uri: OAuth._redirectUri('podio', config),
          client_secret: OAuth.openSecret(config.secret),
          code: query.code
        }
      }).content;
  } catch (err) {
    console.error(err);
    throw _.extend(new Error("Failed to complete OAuth handshake with Podio. " + err.message),
                   {response: err.response});
  }

  // TODO Not the case for Podio
  // this will likely happen the first time
  // If 'responseContent' parses as JSON, it is an error.
  // XXX which facebook error causes this behvaior?
  // if (isJSON(responseContent)) {
  //   throw new Error("Failed to complete OAuth handshake with Podio. " + responseContent);
  // }

  // Success!  Extract the facebook access token and expiration
  // time from the response
  var parsedResponse = JSON.parse(responseContent);
  var podioAccessToken = parsedResponse.access_token;
  var podioRefreshToken = parsedResponse.refresh_token;
  var podioExpiresIn = parsedResponse.expires_in;

  if (!podioAccessToken) {
    throw new Error("Failed to complete OAuth handshake with podio " +
                    "-- can't find access token in HTTP response. " + responseContent);
  }
  return {
    accessToken: podioAccessToken,
    refreshToken: podioRefreshToken,
    expiresIn: podioExpiresIn
  };
};

var getIdentity = function (accessToken) {
  try {
    return HTTP.get("https://api.podio.com/user/status", {
      headers: {
      	Authorization: 'OAuth2 ' + accessToken
      }
  	}).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Podio. " + err.message),
                   {response: err.response});
  }
};

Podio.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};