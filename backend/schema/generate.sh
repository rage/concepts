#!/bin/sh
if [ ! -d generated ]; then
	cd schema
fi
cat extra.graphql > ./generated/schema.graphql
cat datamodel.prisma | sed -E "s/ @.+$//g" >> ./generated/schema.graphql
