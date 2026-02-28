import * as client from 'openid-client';
import dotenv from 'dotenv';
//Sorry for this ugly code and the auth controller; I don't have the bravery to change it 
export async function login(redirectUrl: string) {
  let server!: URL // Authorization Server's Issuer Identifier
  let clientId!: string // Client identifier at the Authorization Server
  let clientSecret!: string // Client Secret

  server = new URL(process.env.ISSUER);
  clientId = process.env.CLIENT_ID;
  clientSecret = process.env.CLIENT_SECRET

  let config: client.Configuration = await client.discovery(
    server,
    clientId,
    clientSecret,
    )

  let redirect_uri: string = redirectUrl;
  let scope: string = "openid profile email" // Scope of the access request


  let code_verifier: string = client.randomPKCECodeVerifier()
  let code_challenge: string = await client.calculatePKCECodeChallenge(code_verifier)
  let state: string = ""

  let parameters: Record<string, string> = {
    redirect_uri,
    scope,
    code_challenge,
    code_challenge_method: 'S256',
  }

  if (!config.serverMetadata().supportsPKCE()) {
    state = client.randomState()
    parameters.state = state
  }
  let redirectTo: URL = client.buildAuthorizationUrl(config, parameters)

  return {
    "redirectUrl": redirectTo.href,
    code_verifier,
    state
  }
}

export async function verifyLogin(currentUrl: URL, code_verifier: string, state: string){
  const issuerUrlString: string | undefined = process.env.ISSUER
  const clientID: string | undefined = process.env.CLIENT_ID
  const clientSecret: string | undefined = process.env.CLIENT_SECRET

  if (issuerUrlString == undefined || clientID == undefined || clientSecret == undefined){
   throw new APIError("OIDC/ENV_NOT_SET");
 }

 const issuer: URL = new URL(issuerUrlString);

 const config: Configuration = await client.discovery(
   issuer,
   clientID,
   clientSecret,
   )
 const tokens = await client.authorizationCodeGrant(
   config,
   currentUrl,
   {
    pkceCodeVerifier: code_verifier,
    expectedState: state == "" ? undefined : state, 
    idTokenExpected: true
  }
  )

 const claims = tokens.claims()!
 const userData = await client.fetchUserInfo(config, tokens.access_token, claims.sub)
    //We save the idToken for disconnection with eirbconnect
 return {
  login: userData.uid,
  firstName: userData.prenom,
  lastName: userData.nom,
  token_id: tokens.id_token,
};
}

export async function disconnect(token){
  let post_logout_redirect_uri = process.env.FRONTEND_IP;

  let server!: URL // Authorization Server's Issuer Identifier
  let clientId!: string // Client identifier at the Authorization Server
  let clientSecret!: string // Client Secret

  server = new URL(process.env.ISSUER);
  clientId = process.env.CLIENT_ID;
  clientSecret = process.env.CLIENT_SECRET

  let config: client.Configuration = await client.discovery(
    server,
    clientId,
    clientSecret,
    )

  let redirectTo = client.buildEndSessionUrl(config, {
    post_logout_redirect_uri: post_logout_redirect_uri,
    id_token_hint: token,
  })

  return {
    "redirectUrl": redirectTo.href,
  }
}
export function isLogged(request){
  return request.session.user;
}
export function isMember(request){
  return request.session.user.member;
}
export function isAdmin(request){
  return request.session.user.admin;
}
export function isMemberOrAdmin(request){
  return (isMember(request) || isAdmin(request))
}
export function currentLogin(request){
  return request.session.user.login;
}
