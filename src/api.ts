import { UserAgentApplication } from "msal";

export const getUrl = (url: string) => {
  return new Promise((resolve, reject) => {
    //callback function for redirect flows
    const tokenReceivedCallback = (
      errorDesc: string,
      token: string,
      error: string,
      tokenType: string
    ) => {
      if (token) {
      } else {
        reject(error + ":" + errorDesc);
      }
    };

    const applicationConfig = {
      clientID: "ad686575-75b0-46a2-997e-d45d0a475451"
    };

    var userAgentApplication = new UserAgentApplication(
      applicationConfig.clientID,
      null,
      tokenReceivedCallback,
      {
        cacheLocation: "localStorage",
        navigateToLoginRequestUrl: false
      }
    );

    const testAPI = (token: string) => {
      var headers = new Headers();
      var bearer = "Bearer " + token;
      headers.append("Authorization", bearer);
      var options = {
        method: "GET",
        headers: headers
      };

      fetch(url, options).then(function(response) {
        resolve(response.json().then(json => json.value));
      });
    };

    var graphScopes = ["https://graph.microsoft.com/.default"];

    const acquireAccessForId = (idToken: string) => {
      //Login Success
      userAgentApplication.acquireTokenSilent(graphScopes).then(
        function(accessToken) {
          //AcquireTokenSilent Success
          testAPI(accessToken);
        },
        function(error) {
          //AcquireTokenSilent Failure, send an interactive request.
          userAgentApplication.acquireTokenRedirect(graphScopes);
        }
      );
    };

    const user = userAgentApplication.getUser();
    if (user) {
      acquireAccessForId(user.userIdentifier);
    } else {
      userAgentApplication.loginRedirect(graphScopes);
    }
  });
};
