# alpha-cli

[![npm](https://img.shields.io/npm/v/@lifeomic/alpha-cli.svg)](https://www.npmjs.com/package/@lifeomic/alpha-cli)
[![Build Status](https://github.com/lifeomic/alpha-cli/actions/workflows/release.yaml/badge.svg)](https://github.com/lifeomic/alpha-cli/actions/workflows/release.yaml)

`alpha-cli` provides a curl-like CLI wrapper around the `alpha` client. This
allows Lambda services to be directly invoked manually.

## Setup

```bash
$ npm install -g @lifeomic/alpha-cli
```

## Usage

```bash
$ alpha --help
Options:
  --help         Show help                                             [boolean]
  -H, --header   Pass custom header line to server
  -X, --request  Specify the request method to use
  --data-binary  Send binary data
  --proxy        Run a local http proxy that passes requests to alpha
  --proxy-port   The port to run the http proxy on
  -V, --version  Show the version number and quit                      [boolean]
  --sign         Sign requests using aws SignatureV4                   [boolean]
  --role         Use STS to assume a role when signing

$ alpha lambda://user-service/users/jagoda | jq
{
  "id": "jagoda",
  "profile": {
    "email": "jeff.jagoda@lifeomic.com"
  }
}
```

### Options

#### sign
Use for services like OpenSearch when set up with Role based auth.
When combined with the `--proxy` option normal RESTful UI tools can then
be used to hit a cluster without additional configuration.
