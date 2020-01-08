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
    name: "AccessToken",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  },
  {
    name: "Privilege",
    embedded: false
  },
  {
    name: "Project",
    embedded: false
  },
  {
    name: "Workspace",
    embedded: false
  },
  {
    name: "WorkspaceParticipant",
    embedded: false
  },
  {
    name: "ProjectParticipant",
    embedded: false
  },
  {
    name: "WorkspaceToken",
    embedded: false
  },
  {
    name: "ProjectToken",
    embedded: false
  },
  {
    name: "CourseLink",
    embedded: false
  },
  {
    name: "Course",
    embedded: false
  },
  {
    name: "ConceptLink",
    embedded: false
  },
  {
    name: "ConceptLevel",
    embedded: false
  },
  {
    name: "Concept",
    embedded: false
  },
  {
    name: "PointGroup",
    embedded: false
  },
  {
    name: "Completion",
    embedded: false
  },
  {
    name: "Tag",
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
