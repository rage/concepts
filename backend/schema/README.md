[source/datamodel.prisma](source/datamodel.prisma) contains the Prisma datamodel,
while [source/extra.prisma](source/extra.prisma) contains the GraphQL queries and
mutations and also extra types that are only used in GraphQL.

The [generated](generated/) directory contains:

* [schema.graphql](generated/schema.graphql) with the full GraphQL API schema.
  Generated with [generate.sh](generate.sh), which basically removes all
  prisma-specific syntax from datamodel.prisma and concatenates it with extra.prisma.
* [prisma-client](generated/prisma-client) with the generated Prisma JS client,
  which is what the backend uses to connect to the database

Both of these should be automatically regenerated when running `prisma deploy` or `prisma generate`.

[prisma-directives.prisma](prisma-directives.prisma) contains GraphQL definitions
for Prisma syntax. It's not actually used for anything, other than optionally
helping editors understand Prisma even if they only support GraphQL.
