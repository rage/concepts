#!/bin/sh
if [ ! -d generated ]; then
  if [ ! -d schema ]; then
    cd backend || exit 1
  fi
	cd schema || exit 1
fi
cat ./source/extra.prisma > ./generated/schema.graphql
sed -E "s/ @.+$//g" < ./source/datamodel.prisma >> ./generated/schema.graphql
echo "Generated schema updated"
