"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  },
  {
    name: "WorkspaceType",
    embedded: false
  },
  {
    name: "Workspace",
    embedded: false
  },
  {
    name: "Course",
    embedded: false
  },
  {
    name: "Concept",
    embedded: false
  },
  {
    name: "Resource",
    embedded: false
  },
  {
    name: "URL",
    embedded: false
  },
  {
    name: "Link",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["ENDPOINT"]}`,
  secret: `$(env:SECRET)`
});
exports.prisma = new exports.Prisma();
