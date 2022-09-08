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

# Interacting with GraphQL lambdas using the Alpha CLI proxy

## Introduction

[insomnia]: https://insomnia.rest/products/insomnia

This is a guide on how to proxy GraphQL requests through `Alpha` in order to be able
to use IDEs to construct and execute queries. While this approach is IDE
agnostic, this will demonstrate how to proxy to the [Insomnia][insomnia] IDE,
offering capabilities like automatic schema detection, auto-complete, linting,
and a convenient way to save queries.

### Install a GraphQL IDE

[Insomnia][insomnia] has a nice interface, but [Postman] and other IDEs should work as well.

If you have [brew](https://brew.sh/), all you need to do to install [Insomnia][insomnia] is
run:

```bash
brew install --cask insomnia
```

## Setup

You'll need to be authenticated against your AWS environment

```bash
# Connect to the proxy
alpha --proxy lambda://my-graphql-lambda:deployed
```

## Usage

Once you're logged in and your proxy is running, launch [Insomnia][insomnia] and
start creating/organizing queries. It may be convenient to organize them by folder.

For a typical GraphQL request, you'll want to configure your request to `POST` to http://localhost:[port],

You'll also likely need to configure headers. If using lifeomic APIs, you may need `lifeomic-account` and `lifeomic-user` depending
on the service:

Depending on how you've configured [Insomnia][insomnia], it will either automatically start fetching the
schema, or you can manually fetch it.

Once you've successfully loaded the schema, you can pull up documentation using the same dialog,
allowing you to click through and copy GraphQL queries/mutations.

Now that the schema is loaded, you can review documentation and create and test queries with
autocomplete
