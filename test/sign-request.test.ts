import yargs from 'yargs';
import { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { mockClient } from 'aws-sdk-client-mock';

import signRequest from '../src/plugins/sign-request';

import { AlphaCliConfig, AlphaCliArguments } from '../src/types';
import { randomUUID } from 'crypto';

const getConfig = async (...args: string[]) => {
  const reqYargs = yargs(args);
  const resolver = signRequest(reqYargs);
  const config = {} as AlphaCliConfig;
  expect(resolver(config, await reqYargs.parse() as AlphaCliArguments)).toBeUndefined();
  return config;
};

const mockSts = mockClient(STSClient);

const expectedCreds: AwsCredentialIdentity = {
  accessKeyId: randomUUID(),
  secretAccessKey: randomUUID(),
  sessionToken: randomUUID(),
  expiration: new Date(),
};

beforeEach(() => {
  mockSts.on(AssumeRoleCommand).resolves({
    Credentials: {
      AccessKeyId: expectedCreds.accessKeyId,
      SecretAccessKey: expectedCreds.secretAccessKey,
      SessionToken: expectedCreds.sessionToken,
      Expiration: expectedCreds.expiration,
    },
  });
});

afterEach(() => {
  mockSts.reset();
});

test('will not sign requests', async () => {
  await expect(getConfig()).resolves.not.toHaveProperty('signAwsV4');
});

test('will sign requests', async () => {
  await expect(getConfig('--sign')).resolves
    .toHaveProperty('signAwsV4', {});
});

test('will set up using sts to assume a role', async () => {
  const role = 'some-stinky-role';
  const config = await getConfig('--sign', '--role', role);
  expect(config).toHaveProperty('signAwsV4', { credentials: expect.any(Function) });
  const { credentials } = config.signAwsV4 as { credentials: Provider<AwsCredentialIdentity>; };

  await expect(credentials()).resolves.toEqual(expectedCreds);
  expect(mockSts.commandCalls(AssumeRoleCommand)).toHaveLength(1);
  expect(mockSts.commandCalls(AssumeRoleCommand)[0].args[0].input).toEqual({
    RoleArn: role,
    RoleSessionName: `Alpha-CLI-${process.env.USER as string}`,
  });
});

test('will throw exception if Credentials is empty', async () => {
  mockSts.on(AssumeRoleCommand).resolves({});
  const role = 'some-stinky-role';
  const config = await getConfig('--sign', '--role', role);
  expect(config).toHaveProperty('signAwsV4', { credentials: expect.any(Function) });
  const { credentials } = config.signAwsV4 as { credentials: Provider<AwsCredentialIdentity>; };

  await expect(credentials()).rejects.toThrowError(`Unable to assume role ${role}`);
});
