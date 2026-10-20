import { ReqResClient } from './ReqResClient.js';

function testClient() {
  const client = new ReqResClient();

  /*const fn = client.getUser;
    fn();*/

  return client.testContext();
}

testClient();
