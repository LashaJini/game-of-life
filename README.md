# game of life

[Conway's game of life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) project built with `rust` + `wasm` + `js`. [Base guide](https://rustwasm.github.io/docs/book/)

## run locally

### using git repo

**requires**: [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html), [npm](https://www.npmjs.com/get-npm) (personally, I prefer using nvm for installating node).

`port` - 3000

```bash
# clone repo
git clone https://github.com/109149/game-of-life

cd game-of-life
# install rust dependencies
cargo build
# build wasm from rust
wasm-pack build

cd www
# install npm dependencies
npm install
npm start
```

### using docker-compose (not recommended)

**requires**: [docker-compose](https://docs.docker.com/compose/install/).

_image created for this project is not optimized in size (cuz of the lack of
knowledge in docker and docker related stuff); everything works, you can still
use it._

`port` - 3000

```bash
# start container
docker-compose up

# run detached (my preferred way)
docker-compose up -d

# force rebuild
docker-compose up --build

# stop container
docker-compose down
```
