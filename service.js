const prettier = require("prettier");
const fs = require("fs/promises");
const path = require("path");
const comments = require("js-comments");
const prefixes = [
  "",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

const helps = {
  "make:controller": {
    description: "Make application controller",
    example:
      "Example: [yarn/npm] make:controller -rams --name UserController --prefix api/v2/ --middleware auth",
    info: [
      {
        name: "--name [name]",
        des: "The name of the controller",
      },
      {
        name: "--prefix [api]",
        des: "Add prefix to url path.",
      },
      {
        name: "--middleware [auth]",
        des: "Provide controllers middleware's name",
      },
      {
        name: "-r",
        des: "Pass this argument to make a resoursefull controller.",
      },
      {
        name: "-a",
        des: "Pass this argument with r to make an api resoursefull controller.",
      },
      {
        name: "-m",
        des: "Pass this argument to make model of the controller.",
      },
      {
        name: "-s",
        des: "Pass this argument with -m to make schema of the model.",
      },
      {
        name: "--brief -b",
        des: "Get command help",
      },
    ],
  },
};

const readFolder = async (dir) => {
  return new Promise(async (resolve, rej) => {
    try {
      var results = [];
      let list = await fs.readdir(dir);
      var pending = list.length;
      if (!pending) return resolve(results);

      for await (const filePath of list) {
        let file = path.resolve(dir, filePath);
        let stat = await fs.stat(file);

        if (stat && stat.isDirectory()) {
          let files = await readFolder(file);
          results = results.concat(files);
          if (!--pending) resolve(results);
        } else {
          results.push(file);
          if (!--pending) resolve(results);
        }
      }
    } catch (error) {
      rej(error);
    }
  });
};

const getRoutes = async () => {
  const controllerDir = path.resolve(__dirname, "./src/controllers/");
  const controllers = await readFolder(controllerDir);
  let routes = [];

  // go throw all files
  for await (const controller of controllers) {
    const string = await fs.readFile(controller, { encoding: "utf-8" }),
      fileExt = path.extname(controller),
      fileName = path.basename(controller, fileExt),
      parsed = comments.parse(string, {});
    const methodsAvailable = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"];
    for await (const fun of parsed) {
      let data = fun,
        match_fname = data.comment.code.match(/\w*[\()]/gm),
        fname =
          match_fname && match_fname.length
            ? match_fname[0].replace(/[\(\)]/gm, "")
            : "";

      let method = data.method
        ? typeof data.method === "string"
          ? String(data.method)
              .toUpperCase()
              .split(",")
              .filter((m) => methodsAvailable.includes(m))
          : data.method
        : ["GET", "HEAD"];

      if (data.route)
        routes.push({
          route: data.route,
          middleware: data.middleware,
          controller,
          name: fileName,
          handler: fname,
          method,
        });
    }
  }

  // return application routes
  return routes;
};

const printRoutes = async () => {
  // cache routes
  await cacheRoutes();
  // get routes
  let routes = await getRoutes(),
    excludePath = path.resolve(process.cwd() + "/src/");
  console.table(
    routes.map((route) => ({
      Path: route.route,
      Method: route.method,
      Middleware: route.middleware,
      Controller: route.controller.replace(excludePath, ""),
      Handler: `${route.name}.${route.handler}(req, rep)`,
    }))
  );
  return true;
};

const cacheRoutes = async () => {
  // get routes
  let routes = await getRoutes();
  // write catch file
  let requires = [
    `import { RouteOptions, FastifyReply, FastifyRequest, RawServerBase } from "fastify"`,
    `import Middleware from "../../middlewares/index"`,
  ];
  let excludeName = [],
    excludeFile = [];
  let body = routes
    .map((route) => {
      let excludePath = path.resolve(process.cwd() + "/src/");

      let file = route.controller
        .split(".")
        .shift()
        .replace(excludePath, "../..");

      let foundFile = Object.values(excludeFile).find((v) => v.file === file);

      let segments = String(route.controller)
        .replace(excludePath + "controllers")
        .split("/");

      let importName = foundFile
        ? foundFile.importName
        : excludeName.includes(route.name)
        ? excludeName.includes(route.name + segments[segments.length - 1])
          ? route.name +
            segments[segments.length - 2] +
            Math.floor(Math.random() * 10)
          : route.name + segments[segments.length - 2]
        : route.name;

      if (!foundFile) {
        let req = `import ${importName} from '${file}'`;
        requires.push(req);
        excludeFile.push({ file, importName });
        excludeName.push(importName);
      }

      return `{method: [${route.method.map((v) => `'${v}'`)}],url:'${
        route.route
      }',handler: (request: FastifyRequest, replay: FastifyReply<RawServerBase>): Promise<any> => {let controller = new ${importName}();return controller.${
        route.handler
      }(request, replay);},${
        route.middleware
          ? "onRequest:[Middleware." + route.middleware + "]"
          : ""
      }}`;
    })
    .join();
  await writeFile(
    path.resolve(__dirname, "./src/core/cache/routes.ts"),
    `${requires.join(
      ";"
    )}; const routes:RouteOptions[] = [${body}];export default routes;`
  );
  return true;
};

const makeController = async (args) => {
  const { name, prefix, middleware, brief, b, r, a = true, m, s } = args;
  if (brief || b) {
    return printHelpData("make:controller");
  }

  // check if name provided or not
  if (!name)
    return console.error(
      "\x1b[31m%s\x1b[0m",
      "yarn make:controller --name [name] is required. type -b --brief for help"
    );

  // create name
  let dirAndName = String(name).split("/");

  // controller name
  let controllerName = dirAndName.pop();
  // create dir first
  await rMakeDir(path.resolve(__dirname, "./src/controllers/"), [
    ...dirAndName,
  ]);
  let filePath = path.resolve(
    __dirname,
    `./src/controllers/${[...dirAndName, controllerName].join("/")}.ts`
  );

  try {
    await fs.stat(filePath);
    return console.error(
      "\n\t\x1b[31m%s\x1b[0m\n",
      `${controllerName} already exist.`
    );
  } catch (error) {
    // let's begain to make the controller
    const methods = {
      index: {
        api: true,
        method: a ? "POST" : "",
        description: "To index the model data.",
      },
      show: {
        api: true,
        method: a ? "POST" : "",
        param: ":id",
        description: "Show model data.",
      },
      create: {
        api: false,
        description: "Create file show.",
      },
      store: {
        api: true,
        method: ["PUT", "PATCH"],
        description: "Store data to database.",
      },
      edit: {
        api: false,
        param: ":id",
        description: "Edit page show.",
      },
      update: {
        api: true,
        param: ":id",
        method: ["PUT", "PATCH"],
        description: "Update model data.",
      },
      destroy: {
        api: true,
        method: a ? "DELETE" : "",
        param: ":id",
        description: "Delete data from the database.",
      },
    };
    const modelName = controllerName.replace(/Controller/gi, "");
    let schemaName = s
      ? await makeSchema({
          name: `${modelName}RequestSchema`,
          methods: Object.keys(methods).filter((k) =>
            a ? methods[k].api : true
          ),
        })
      : undefined;
    const functions = Object.keys(methods)
      .filter((key) => (a ? methods[key].api : true))
      .map((key) =>
        functionMaker(
          key,
          `${prefix ? prefix : a ? "/api" : ""}/${String(
            modelName
          ).toLowerCase()}/${key}/${methods[key].param ?? ""}`,
          middleware,
          methods[key].method,
          methods[key].description,
          schemaName ? `${schemaName}.${key}` : undefined
        )
      )
      .join("\n");
    const dirDeep = new Array(dirAndName.length + 1).fill("..").join("/");
    const template = `import Controller from '${dirDeep}/core/Controller';\nimport { FastifyRequest } from "fastify";\nimport Response from "${dirDeep}/core/extendeds/Response";\nimport {Api400Exception} from "${dirDeep}/core/extendeds/Exception";\n\nexport default class ${controllerName} extends Controller{
      constructor(request: FastifyRequest){
        super(request);
      }
      ${r ? functions : "\n\n"}}`;
    // write the file
    await writeFile(filePath, template);
    // make model if needed
    if (m) {
      await makeModel({ name: modelName });
    }
    return console.info(
      "\t\x1b[32m%s\x1b[0m\n",
      `controllers/${[...dirAndName, controllerName].join("/")}.ts`
    );
  }
};

const makeModel = async (args) => {
  const { name, prefix, middleware, force, brief, b, r, a, c, s } = args;
  if (brief || b) {
    return printHelpData("make:model");
  }

  // check if name provided or not
  if (!name)
    return console.error(
      "\x1b[31m%s\x1b[0m",
      "yarn make:model --name [name] is required. type -b --brief for help"
    );

  // create name
  let dirAndName = String(name).split("/");

  // model name
  let modelName = dirAndName.pop();

  const controllerName = modelName + "Controller";
  // create dir first
  await rMakeDir(path.resolve(__dirname, "./src/controllers/"), [
    ...dirAndName,
  ]);
  let filePath = path.resolve(
    __dirname,
    `./src/models/${dirAndName.join("/")}/${modelName}.ts`
  );

  try {
    // if force then proceed the oparetion
    if (force) throw "Make model";

    // check file exist or not
    await fs.stat(filePath);

    // if exist then go throw error
    return console.error(
      "\n\t\x1b[31m%s\x1b[0m\n",
      `${modelName} already exist.`
    );
  } catch (error) {
    // let's make the template
    const templatefile = (
      await fs.readFile("./src/core/internal/schema_template.txt", {
        encoding: "utf-8",
      })
    ).replace(/@replace/gm, modelName);

    // write the file
    await writeFile(filePath, templatefile);

    // if the controller argument pass then create the controller
    if (c) {
      await makeController({
        prefix,
        middleware,
        r,
        a,
        s,
        name: controllerName,
      });
    } else if (s) {
      await makeSchema({
        name: `${modelName}RequestSchema`,
      });
    }

    // inform to console
    return console.info(
      "\t\x1b[32m%s\x1b[0m\n",
      `models/${[...dirAndName, modelName].join("/")}.ts`
    );
  }
};

const makeSchema = async (args) => {
  const { name, methods } = args;
  if (!name) {
    return console.error(
      "\x1b[31m%s\x1b[0m",
      "yarn make:schema --name [name] is required. type -b --brief for help"
    );
  }
  const schemaIndex = path.resolve(__dirname, "./src/schema/index.ts");
  const fileString = await fs.readFile(schemaIndex, { encoding: "utf-8" });
  const exportLine = fileString.match(/^export\s+default(.*?)}/gms); // get default exports
  const pattern = /(?:{??[^{]*?})/gm;
  const matches = exportLine.shift().match(pattern);
  if (matches.length && matches[0]) {
    const matchData = matches[0];
    const exportItems = String(matchData)
      .replace(/\{|\}|\\n|\s|\\r|\\t/gm, "")
      .split(",")
      .filter((v) => v != "");
    const schemaPropertytemplate = `\n@name:{type: "object", properties:{}}\n`;
    const singleSchematemplate = `const @name : Schema = {\n ${[
      "body",
      "headers",
      "querystring",
      "params",
      "response",
    ]
      .map((item) => schemaPropertytemplate.replace("@name", `//${item}`))
      .join("\n")} \n}`;
    const schemaMethods = Array.isArray(methods)
      ? methods
      : typeof methods === "string"
      ? methods.trim().split(",")
      : [];
    const template = `import Schema from "../core/extendeds/Schema";\n\n${schemaMethods
      .map((method) => singleSchematemplate.replace("@name", method))
      .join("\n")}\nexport default {${schemaMethods}};`;

    const schemaFileName = await uniqueFileName(
      `${__dirname}/src/schema`,
      name,
      "ts"
    );

    await writeFile(
      path.resolve(__dirname, "src/schema", `${schemaFileName}.ts`),
      template
    );

    exportItems.push(schemaFileName);
    const indexing = fileString.replace(
      /^export\s+default(.*?)}/gms,
      `import ${schemaFileName} from './${schemaFileName}';\nexport default {${exportItems}}`
    );
    await writeFile(path.resolve(__dirname, "src/schema/index.ts"), indexing);

    // inform to console
    console.info(
      "\t\x1b[32m%s\x1b[0m\n",
      `schema/${schemaFileName}.ts`
    );

    return schemaFileName;
  }
};

const printHelpData = (key) => {
  let help = helps[key];
  let infos = help.info.map((elm) => `\t${elm.name}\t\t${elm.des}`).join("\n");
  console.log("\t\x1b[36m%s\x1b[0m", help.description);
  console.log("\n\t\x1b[32m%s\x1b[0m\n", help.example);
  console.info(infos);

  return true;
};

const functionMaker = (name, route, middleware, method, desc, schema) => {
  return `\n/**
  * ${desc ?? ""}
  * @route ${route}${middleware ? "\n* @middleware " + middleware : ""}${
    method ? `\n* @method ${method}` : ""
  }${schema ? `\n* @schema ${schema}` : ""}
  */
 public async ${name}(): Promise<Response<object>>{
   try{
    // ...code
    // must return response
    return Response.json({hello: 'world'});
   } catch(error) {
    this.request.log.error(error);
    throw new Api400Exception("So bad");
   }
 }\n`;
};

const writeFile = async (dir, data) => {
  await fs.writeFile(
    dir,
    prettier.format(data, {
      parser: "typescript",
    })
  );
};

const rMakeDir = async (base, params) => {
  if (params.length) {
    let path = params.shift();
    try {
      if (path) await fs.mkdir(base + "/" + path);
    } catch (error) {
      // console.log("ERROR");
    }
    if (params.length) {
      await rMakeDir(base + "/" + path, params);
    }
  }
  return true;
};

const uniqueFileName = async (dir, file, ext, prefix) => {
  const p = prefix ? [...prefix] : [...prefixes];
  const fname = `${file}${
    p.length > 0 ? p.shift() : Math.floor(Math.random() * 100)
  }`;
  try {
    let a = await fs.stat(path.resolve(dir, `${fname}.${ext}`));
    return uniqueFileName(dir, file, ext, p);
  } catch (error) {
    return fname;
  }
};

// export all functions
module.exports = {
  readFolder,
  getRoutes,
  cacheRoutes,
  printRoutes,
  makeController,
  makeModel,
  makeSchema,
};
