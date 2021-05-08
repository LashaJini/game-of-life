#!/bin/bash

cd www \
  && npm run build:prod \
  && mv dist ../
