# Apollo GraphQL Express Server Template

[![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/vlt_8bdf75ce450eade46ab48df564cb8e608e2a841958474f622d78e94340fc85a1/example)

## Technologies

- [Apollo GraphQL](https://www.apollographql.com/docs/)
- [Prisma/PostgreSQL](https://www.prisma.io/)
- [Redis](https://www.npmjs.com/package/ioredis)
- [Dotenv Vault](https://github.com/dotenv-org/dotenv-vault)

## Prerequisites

- [Docker](https://docs.docker.com/)

## Getting Started

### Environment Variables

#### New project

- Create a `.env` file by copying the [`.env.example`](https://vault.dotenv.org/project/vlt_8bdf75ce450eade46ab48df564cb8e608e2a841958474f622d78e94340fc85a1/example)

- Create a Sentry [project](https://sentry.io/) and set the `SENTRY_DSN` variable

- Create a new dotenv vault

```sh
npx dotenv-vault new -y
```

#### Existing project

Login to dotenv-vault

```sh
npx dotenv-vault login -y
```

```sh
npx dotenv-vault pull
```

### Build container image

```sh
yarn docker:build:dev
```

### Run the application stack

```sh
docker compose up
```

### Stop application stack

```sh
docker compose down
```

### Test

```sh
yarn docker:test
```

## CI/CD

Follow the official docker [documentation](https://docs.docker.com/language/nodejs/configure-ci-cd/#step-one-create-the-repository) to setup GitHub workflow.

Add your `DOTENV_KEY` to the github repo secrets

## Development

This template supports all [`graphql-scalars`](https://the-guild.dev/graphql/scalars/docs/quick-start)

### Google OAuth

Create a Firebase account and get the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from your app's google cloud platform console

Generate test idTokens from [google playground](https://developers.google.com/oauthplayground/)

## Troubleshoot

**App using old env variables**

Run `npx dotenv-vault build`

**Docker Unable to connect to database server**

Downgrade Dockerfile base to Node 14
