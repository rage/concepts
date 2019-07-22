#!/bin/sh
cat schema-extra.graphql > generated/schema.graphql
cat datamodel.prisma | sed -E "s/ @.+$//g" >> generated/schema.graphql
