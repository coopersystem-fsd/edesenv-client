# Edesenv Client

A NodeJS Client crawler that extracts the check point data from Edesenv

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/coopersystem-fsd/edesenv-client/main)

## Install

```sh
yarn add @coopersystem-fsd/edesenv-client
```

## Usage

Create an instance of `EdesenvClient` to call the avaialable APIs. E.g.:

```ts
import { EdesenvClient } from '@coopersystem-fsd/edesenv-client';

const client = new EdesenvClient({
  username: 'your.user',
  password: 'secret'
});
await client.getCheckPointEntriesToday();
```

## APIs

| Method                    | Description                                                   | Return  |
|---------------------------|---------------------------------------------------------------|---------|
| getCheckPointEntriesToday | Return the check point entries registered for the actual day. | Date[]  |
| checkin                   | Create an entry check point for today (TODO)                  | boolean |
| checkout                  | Create an exit check point for today (TODO)                   | boolean |
