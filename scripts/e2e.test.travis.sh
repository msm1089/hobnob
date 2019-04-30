#!/usr/bin/env bash
sc query state= all
echo Running tests...
npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps