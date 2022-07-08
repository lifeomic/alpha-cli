import { Argv } from 'yargs';
import { STS } from '@aws-sdk/client-sts';
import { Arguments, Config } from '../types';

export default (yargs: Argv) => {
  yargs.option('sign', {
    type: 'boolean',
    default: false,
    describe: 'Sign requests with AWS SignatureV4',
  })
    .option('role', {
      type: 'string',
      describe: 'Role to assume when signing',
    });

  return (config: Config, { sign, role }: Arguments) => {
    if (!sign) {
      return config;
    }
    config.signAwsV4 = {};
    if (role) {
      const sts = new STS({});
      config.signAwsV4.credentials = async () => {
        const { Credentials } = await sts.assumeRole({
          RoleArn: role,
          RoleSessionName: `Alpha-CLI-${process.env.USER as string}`,
        });
        if (!Credentials) {
          throw new Error(`Unable to assume role ${role}`);
        }
        return {
          accessKeyId: Credentials.AccessKeyId as string,
          secretAccessKey: Credentials.SecretAccessKey as string,
          sessionToken: Credentials.SessionToken,
          expiration: Credentials.Expiration,
        };
      };
    }
  };
};
