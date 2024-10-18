# knx-ip-ts
An attempt at implementing the KNXnet/IP protocol in typescript.
> [!WARNING]
> This package is an early __experiment__, and thus you probably should avoid using it.

> [!IMPORTANT]
> Node version 22 or higher is required to run this library.

> [!NOTE]
> Although I want to make this library as spec-compliant as possible, it's tough because I don't have access to the newest version of the KNX spec (using v2.1).

## Objectives
The aim of this library is to support the following services both on the client and server side. This means that once the library is completed (if ever), it'll be possible to build end devices as well as proxies/servers (eg. a proxy that uses a tunneling connection and acts as a KNX IP router for its clients).
- [x] Discovery
- [ ] Tunneling
- [ ] Routing
- [ ] KNX Secure

## Examples
You can view a full usage example inside the `example` directory. To play with it, clone the repo, `npm i && cd ./example && npm i` and run the example script using `npm run start`.

## Documentation
Coming soon!

---
Contributions are always welcome!
