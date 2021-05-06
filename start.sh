#!/bin/bash

wasm-pack build \
  && cd www \
  && npm start
