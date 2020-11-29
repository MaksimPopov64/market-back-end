import { APIGatewayAuthorizerHandler, APIGatewayTokenAuthorizerEvent, PolicyDocument } from 'aws-lambda';

export const basicAuthorizer: APIGatewayAuthorizerHandler = (event: APIGatewayTokenAuthorizerEvent, _context, cb) => {
  if (!event.authorizationToken) {
    return cb('Unauthorized');
  }

  try {
    const authToken = event.authorizationToken;
    const encodedCreds = authToken.split(' ');

    if (!isTokenValid(encodedCreds)) {
      return cb('Unauthorized');
    }
    console.log(encodedCreds, process.env.password);
    const buff = Buffer.from(encodedCreds[1], 'base64');
    const [username, password] = buff.toString('utf-8').split(':');   
    const savedPassword = process.env.password;
    const savedUsername = process.env.username;
    const effect = !username || !password ? 'Deny' : (savedPassword && password === savedPassword && savedUsername && username === savedUsername ? 'Allow' : 'Deny');

    const policyDocument = createPolicy(effect, event.methodArn);

    return cb(null, {
      principalId: username,
      policyDocument,
    });
  } catch (err) {
    return cb('Unauthorized');
  }
};

const createPolicy = (effect: string, resourceArn: string): PolicyDocument => ({
  Version: '2012-10-17',
  Statement: [
    {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resourceArn,
    },
  ],
});

const isTokenValid = (token: string[]) => token.length === 2 && token[0].toLowerCase() === 'basic';