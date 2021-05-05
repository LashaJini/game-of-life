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

**requires**: [docker](https://docs.docker.com/get-docker/), [docker-compose](https://docs.docker.com/compose/install/).

_image created for this project is not optimized in size (cuz of the lack of
knowledge in docker and docker related stuff); everything works, you can still
use it._

`port` - 3000

with cloning:

```bash
# clone repo
git clone https://github.com/109149/game-of-life

# start container
docker-compose up

# utils:

# run detached (my preferred way)
docker-compose up -d

# force rebuild
docker-compose up --build

# stop and remove container
docker-compose down
```

without cloning (from docker hub):

```bash
# run detached (-d) container 109149-game-of-life (--name)
# on port (-p) 3000 and execute command `npm start`.
# This will pull image from docker hub if not previously installed.
docker run -d -p 3000:3000 --name 109149-game-of-life 109149/game-of-life npm start

# stop and remove container
docker stop 109149-game-of-life && docker rm 109149-game-of-life
```

to list and remove image from your computer (first you need to remove all dependent containers):

```bash
# list images
docker images

# remove
docker image rm 109149/game-of-life
# or
docker image rm <image id>
```
