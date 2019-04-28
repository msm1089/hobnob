#!/usr/bin/env bash
yarn run serve & npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps