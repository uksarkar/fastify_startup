const prettier = require("prettier");
const fs = require("fs/promises");
const {
    writeFileSync,
    accessSync,
    readFileSync,
    copyFileSync,
    constants,
} = require("fs");
const path = require("path");
const comments = require("js-comments");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { exec } = require("child_process");
const dotenv = require("dotenv");
const nodemon = require("gulp-nodemon");

/**
 * @var {string[]} prefixes Default prefixes
 */
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

// arguments of commands
const helpArgs = {
    "--prefix [name]": "Add prefix to url path.",
    "--middleware [auth]": "Provide controllers middleware name",
    "-r": "Pass this argument to make a resourceful controller.",
    "-m": "Pass this argument to make model of the controller.",
    "-s": "Pass this argument with -m to make schema of the model.",
    "-p": "Pass this argument to make Policy of the Controller.",
    "-c": "Pass this argument to make Controller of the Model.",
    "--help -h": "To get command help.",
};

/**
 * All help information's
 */
const helps = {
    "make:controller": {
        description: "Make application controller",
        example:
      "Example: node fs make:controller UserController -rmso --prefix api/v2/ --middleware auth",
        args: ["--prefix [name]", "--middleware [auth]", "-r", "-m", "-s", "-o"],
    },
    "make:model": {
        description: "Make application Model",
        example:
      "Example: node fs make:model User -crso --prefix api/v2/ --middleware auth",
        args: ["--prefix [name]", "--middleware [auth]", "-r", "-c", "-s", "-o"],
    },
    "make:schema": {
        description: "Make application request schema",
        example:
      "Example: node fs make:schema UserRequest --methods index,show,store,update,destroy",
    },
    "make:policy": {
        description: "Make request policy",
        example: "Example: node fs make:policy UserPolicy",
    },
    "make:notification": {
        description: "Make application notification",
        example:
      "Example: node fs make:notification NewUserRegisterNotification --methods byMail,bySMS",
    },
    "make:event": {
        description: "Make application event",
        example:
      "Example: node fs make:event UserEvent --on onRegister,onUpdate,onMakePayment",
    },
    "route:cache": {
        description: "Cache application routes",
        example: "Example: node fs route:cache",
    },
    "route:list": {
        description: "List all the application routes",
        example: "Example: node fs route:list",
    },
};

/**
 *
 * @param {string} dir destination
 * @returns {string}
 */
const getPathFromRoot = (dir) => {
    return path.resolve(process.cwd(), dir);
};

/**
 * Read folder and return all the files of the folder
 * recursively
 * @param {string} dir location of the directory to start scanning
 * @returns {Promise<string[]>} return the files path
 */
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

/**
 * Generate unique file name of a directory
 * @param {string} dir location of the directory
 * @param {string} file Name of the file
 * @param {string} ext extension of the file
 * @param {string[]} prefix If the file exists then this prefixes will be added
 * @returns {Promise<string>} Name of the unique file
 */
const getUniqueFileName = async (dir, file, ext, prefix) => {
    const p = prefix ? [...prefix] : [...prefixes];
    const fname = `${file}${
        p.length > 0 ? p.shift() : Math.floor(Math.random() * 100)
    }`;
    try {
        await fs.stat(path.resolve(dir, `${fname}.${ext}`));
        return getUniqueFileName(dir, file, ext, p);
    } catch (error) {
        return fname;
    }
};

/**
 *  Make directory recursively
 * @param {string} base The dir path to start
 * @param {string|string[]} location The path separated by '/' or array of foldername
 * @returns {Promise<boolean>}
 */
const rMakeDir = async (base, location) => {
    const params =
    typeof location === "string" ? location.trim().split("/") : location;

    if (params.length) {
        let p = params.shift();
        try {
            if (p) await fs.mkdir(base + "/" + p);
        } catch (error) {
            // console.log("ERROR");
        }
        if (params.length) {
            return rMakeDir(base + "/" + p, params);
        }
    }
    return true;
};

/**
 * Write a file to disk
 * @param {string} dir The directory to write file
 * @param {any} data Content of the file
 * @returns {Promise<boolean>}
 */
const writeFile = async (dir, data, options) => {
    const { parser = "typescript" } = options || {};
    try {
        await fs.writeFile(
            dir,
            prettier.format(data, {
                parser,
                tabWidth: 4,
            }),
        );
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Copy production ready package.json file to dist folder
 */
const copyPackageDotJsonToDist = async () => {
    let data = require(getPathFromRoot("./package.json")),
        { scripts, devDependencies, ...rest } = data,
        writeAbleData = JSON.stringify(
            { ...rest, scripts: { start: "node init.js", serve: "npm run start" } },
            null,
            "\t",
        );

    // write json file to
    await writeFile(getPathFromRoot("./dist/package.json"), writeAbleData, {
        parser: "json",
    });
};

/**
 * Copy dot env file to destination
 * @param {string} to Location to copy
 */
const copyDotEnvFile = (to) => {
    let dotenvPath = checkFileExists(getPathFromRoot("./src/.env"))
        ? getPathFromRoot("./src/.env")
        : checkFileExists(getPathFromRoot("./src/.env.example"))
            ? getPathFromRoot("./src/.env.example")
            : null;
    if (dotenvPath) {
        let data = readFileSync(dotenvPath, { encoding: "utf-8" });
        writeFileSync(to, data);
    } else {
        console.log("No ENV file detected!");
    }
};

/**
 * Cache env data from example to dev location or to dist location
 * @param {string} from The base file location
 * @param {string} to Path to cache
 */
const cacheEnvFile = (from, to) => {
    if (checkFileExists(from)) {
        let data = dotenv.parse(readFileSync(from));
        writeFileSync(to, JSON.stringify(data, null, "\t"));
    } else {
        console.error("ENV file not found.");
    }
};

/**
 * Check file exist or not
 * @param {string} location path to the file
 * @returns {boolean}
 */
const checkFileExists = (location) => {
    let flag = true;
    try {
        accessSync(location, constants.F_OK);
    } catch (e) {
        flag = false;
    }
    return flag;
};

/**
 * Make some required folder and files
 */
const configureDist = async () => {
    await cacheRoutes();
    copyDotEnvFile(getPathFromRoot("./dist/.env"));
    cacheEnvFile(
        getPathFromRoot("./dist/.env"),
        getPathFromRoot("./dist/core/cache/env.json"),
    );
    await copyPackageDotJsonToDist();
    await rMakeDir(getPathFromRoot("dist"), "storage/log");
    await rMakeDir(getPathFromRoot("dist"), "storage/public");
    const publicFiles = await readFolder(getPathFromRoot("src/public"));
    if (publicFiles) {
        for await (const src of publicFiles) {
            const filename = path.basename(src);
            const filePath = src
                .replace(process.cwd() + "/src", "")
                .replace(filename, "");
            await rMakeDir(getPathFromRoot("dist"), filePath);
            copyFileSync(src, getPathFromRoot("dist/" + filePath + "/" + filename));
        }
    }
};

/**
 * Make some required folder and files
 */
const configureDev = async () => {
    if (!checkFileExists(getPathFromRoot("./src/.env"))) {
        copyDotEnvFile(getPathFromRoot("./src/.env"));
    }

    await rMakeDir(getPathFromRoot("src"), "storage/log");
    await rMakeDir(getPathFromRoot("src"), "storage/public");

    if (!checkFileExists(getPathFromRoot("src/storage/log/fastify.log"))) {
        writeFileSync(getPathFromRoot("src/storage/log/fastify.log"), "");
    }

    await rMakeDir(getPathFromRoot("./src/core"), "cache");
    cacheEnvFile(
        getPathFromRoot("./src/.env"),
        getPathFromRoot("./src/core/cache/env.json"),
    );

    await cacheRoutes();
};

/**
 * Print help data
 * @param {keyof object | undefined} key The key of the corresponding command help
 */
const printHelp = (key) => {
    let help = helps[key];
    if (help) {
        console.log("\t\x1b[36m%s\x1b[0m", help.description);
        console.log("\t\x1b[32m%s\x1b[0m\n", help.example);

        const args = help.args ? ["--help -h", ...help.args] : ["--help -h"];
        const argMessages = Object.keys(helpArgs)
            .filter((k) => args.includes(k))
            .map((key) => `${key}@${helpArgs[key]}`);
        console.info(
            getSeparatedString(argMessages, { linePrefix: "\t", msgPrefix: "-" }),
        );
    } else {
        console.log("\t\x1b[33m%s\x1b[0m", "The supported command list...\n");
        const allMessages = Object.keys(helps).map(
            (key) => `${key}@${helps[key].description}`,
        );
        console.info(
            getSeparatedString(allMessages, { linePrefix: "\t", msgPrefix: "-" }),
        );
    }
};

/**
 *
 * @param {string[]} msgArray Messages with separator
 * @param {{spaces: number, divider: string, separator: string, linePrefix: string, msgPrefix: string}} options Provide options
 * @returns {string} Combined messages
 */
const getSeparatedString = (msgArray, options) => {
    const {
        spaces = 4,
        divider = "@",
        separator = "\n",
        linePrefix = "",
        msgPrefix = "",
    } = options;
    const baseLength =
    msgArray.reduce(
        (c, n) =>
            c > n.split("@").shift().length ? c : n.split("@").shift().length,
        0,
    ) + spaces;
    return msgArray
        .map(
            (msg) =>
                linePrefix +
        String(msg).replace(
            divider,
            " ".repeat(baseLength - String(msg).split("@").shift().length) +
            msgPrefix,
        ),
        )
        .join(separator);
};

/**
 * Print message to console in red color
 * @param {string} msg The message to print
 */
const printMsg = (msg) => {
    console.log("\x1b[31m%s\x1b[0m", msg);
};

/**
 * Controller single method maker
 * @param {string} name The function
 * @param {string} route Route location
 * @param {String?} middleware Middleware name
 * @param {String[]?} method Request method array
 * @param {String?} desc Description of the function
 * @param {String?} schema Request schema name
 * @returns {string} the function definition
 */
const controllerFunctionMaker = (
    name,
    route,
    middleware,
    method,
    desc,
    schema,
) => {
    return `\n/**
    * ${desc ?? ""}
    * @route ${route}${middleware ? "\n* @middleware " + middleware : ""}${
    method ? `\n* @method ${method}` : ""
}${schema ? `\n* @schema ${schema}` : ""}
    */
   public async ${name}(request: FRequest<unknown>,\nreplay: FReplay,): Promise<Response<unknown>>{
      // ...code
      // must return response
      return Response.json({hello: 'world'});
   }\n`;
};

/**
 * Get All Routes array to cache
 * @returns {Promise<{ route: any; middleware: any; controller: string; name: string; handler: any; method: any; schema: any; }[]>}
 */
const getRoutes = async () => {
    const controllerDir = path.resolve(
        process.cwd(),
        "./src/app/request/controllers/",
    );
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
                    schema: data.schema,
                });
        }
    }

    // return application routes
    return routes;
};

/**
 * Cache all routes to 'src/core/cache/routes.ts'
 */
const cacheRoutes = async () => {
    // get routes
    let routes = await getRoutes();
    // write catch file
    let requires = [
        `import RouteDefinition from "../extendeds/RouteDefinition"`,
        `import middleware from "../../app/request/middlewares"`,
        `import schema from "../../app/request/schema"`,
    ];
    let excludeName = [],
        excludeFile = [],
        schemaImports = [],
        middlewareImports = [];
    let body = routes
        .map((route) => {
            let excludePath = path.resolve(process.cwd() + "/src/app/request/");

            let file = route.controller
                .split(".")
                .shift()
                .replace(excludePath, "../../app/request");

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
            // if(route.schema){
            //   let schemaName = route.schema.split('.').shift();
            //   if(!schemaImports.includes(schemaName.trim())){
            //     schemaImports.push(schemaName.trim());
            //   }
            // }
            // if(route.middleware){
            //   let mName = route.middleware.split('.').shift();
            //   if(!middlewareImports.includes(mName)){
            //     middlewareImports.push(mName);
            //   }
            // }
            return `{method: [${route.method.map((v) => `'${v}'`)}],url:'${
                route.route
            }',controller: ${importName},handler: '${route.handler}'${
                route.middleware
                    ? ",middleware:[middleware." + route.middleware.trim() + "]"
                    : ""
            }${route.schema ? ",schema:schema." + route.schema.trim() : ""},}`;
        })
        .join();
    //add middleware imports
    // if(middlewareImports.length)
    // requires.push(`import {${middlewareImports}} from "../../middlewares"`);
    // add schema imports
    // if(schemaImports.length)
    // requires.push(`import {${schemaImports}} from "../../schema"`);

    await writeFile(
        path.resolve(process.cwd(), "./src/core/cache/routes.ts"),
        `${requires.join(
            ";",
        )}; const routes:RouteDefinition[] = [${body}];export default routes;`,
    );
};

/**
 * Make a controller
 * @param {{name:string, prefix:string, middleware: string, brief: boolean, b: boolean, r: boolean, m: boolean, s: boolean, p: boolean}} args
 */
const makeController = async (args) => {
    const { name, prefix, middleware, brief, b, r, a = true, m, s, p } = args;
    if (brief || b) {
        return printHelp("make:controller");
    }

    // check if name provided or not
    if (!name)
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:controller [name] is required. type -h --help for help",
        );

    // create name
    let dirAndName = String(name).split("/");

    // controller name
    let controllerName = dirAndName.pop();
    // create dir first
    await rMakeDir(
        path.resolve(process.cwd(), "./src/app/request/controllers/"),
        [...dirAndName],
    );
    let filePath = path.resolve(
        process.cwd(),
        `./src/app/request/controllers/${[...dirAndName, controllerName].join(
            "/",
        )}.ts`,
    );

    try {
        await fs.stat(filePath);
        return console.error(
            "\n\t\x1b[31m%s\x1b[0m\n",
            `${controllerName} already exist.`,
        );
    } catch (error) {
    // let's began to make the controller
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
                    a ? methods[k].api : true,
                ),
            })
            : undefined;
        const functions = Object.keys(methods)
            .filter((key) => (a ? methods[key].api : true))
            .map((key) =>
                controllerFunctionMaker(
                    key,
                    `${
                        prefix
                            ? prefix[0] === "/"
                                ? prefix
                                : "/" + prefix
                            : a
                                ? "/api"
                                : ""
                    }/${String(modelName).toLowerCase()}/${key}${
                        methods[key].param ? "/" + methods[key].param : ""
                    }`,
                    middleware,
                    methods[key].method,
                    methods[key].description,
                    schemaName ? `${schemaName}.${key}` : undefined,
                ),
            )
            .join("\n");
        // const dirDeep = new Array(dirAndName.length + 2).fill("..").join("/");

        if (p) {
            await makePolicy({
                name: `${modelName}Policy`,
                methods: Object.keys(methods).filter((key) =>
                    a ? methods[key].api : true,
                ),
            });
        }
        const template = `import Controller from '@supports/Controller';\nimport { FReplay, FRequest } from "@supports/RequestReplay";\nimport Response from "@supports/Response";\n${
            p ? `import ${modelName}Policy from '@policies/${modelName}Policy'` : ""
        }\n\nexport default class ${controllerName} extends Controller{
        constructor(){
          super(${p ? `${modelName}Policy` : ""});
        }
        ${r ? functions : "\n\n"}}`;
        // write the file
        await writeFile(filePath, template);
        // make model if needed
        if (m) {
            await makeModel({ name: modelName });
        }
        console.info(
            "\t\x1b[32m%s\x1b[0m\n",
            `controllers/${[...dirAndName, controllerName].join("/")}.ts`,
        );
    }
};

/**
 * Make a model
 * @param {{name:string, prefix:string, middleware: string, brief: boolean, b: boolean, r: boolean, m: boolean, s: boolean, p: boolean}} args
 * @returns
 */
const makeModel = async (args) => {
    const { name, prefix, middleware, force, r, a, c, s, p } = args;

    // check if name provided or not
    if (!name)
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:model [name] is required. type -h --help for help",
        );

    // create name
    let dirAndName = String(name).split("/");

    // model name
    let modelName = dirAndName.pop();

    const controllerName = modelName + "Controller";
    // create dir first
    await rMakeDir(
        path.resolve(process.cwd(), "./src/app/request/controllers/"),
        [...dirAndName],
    );
    let filePath = path.resolve(
        process.cwd(),
        `./src/app/models/${[...dirAndName, modelName].join("/")}.ts`,
    );

    try {
    // if force then proceed the operation
        if (force) throw "Make model";

        // check file exist or not
        await fs.stat(filePath);

        // if exist then go throw error
        return console.error(
            "\n\t\x1b[31m%s\x1b[0m\n",
            `${modelName} Model already exist.`,
        );
    } catch (error) {
    // let's make the template
        const templatefile = (
            await fs.readFile(path.resolve(__dirname, "schema_template.txt"), {
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
                p,
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
            `models/${[...dirAndName, modelName].join("/")}.ts`,
        );
    }
};

/**
 * Make a schema
 * @param {{name:string, methods:string}} args
 * @returns
 */
const makeSchema = async (args) => {
    const { name, methods } = args;
    if (!name) {
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:schema [name] is required. type -h --help for help",
        );
    }
    const schemaIndex = path.resolve(
        process.cwd(),
        "./src/app/request/schema/index.ts",
    );
    const fileString = await fs.readFile(schemaIndex, { encoding: "utf-8" });
    const exportLine = fileString.match(/^export\s+default(.*?)}/gms); // get default exports
    const pattern = /(?:{??[^{]*?})/gm;
    const matches = exportLine.shift().match(pattern);
    if (matches.length && matches[0]) {
        const matchData = matches[0];
        let exportItems = String(matchData)
            .replace(/\{|\}|\\n|\s|\\r|\\t/gm, "")
            .split(",")
            .filter((v) => v != "");
        const schemaPropertytemplate = `  // @name: {
        //   type: "object",
        //   properties: {}
        // }\n`;
        const singleSchematemplate = `const @name : Schema = {\n ${[
            ...["body", "headers", "querystring", "params"].map((item) =>
                schemaPropertytemplate.replace("@name", item),
            ),
            `  // response: {
          //   200: {
          //     type: "object",
          //     properties: {},
          //   },
          // }`,
        ].join("\n")} \n}`;
        const schemaMethods = Array.isArray(methods)
            ? methods
            : typeof methods === "string"
                ? methods.trim().split(",")
                : [];
        const template = `import Schema from "@supports/Schema";\n\n${schemaMethods
            .map((method) => singleSchematemplate.replace("@name", method))
            .join("\n")}\nexport default {${schemaMethods}};`;

        const schemaFileName = await getUniqueFileName(
            `${process.cwd()}/src/app/request/schema`,
            name,
            "ts",
        );

        await writeFile(
            path.resolve(
                process.cwd(),
                "src/app/request/schema",
                `${schemaFileName}.ts`,
            ),
            template,
        );
        
        if(!exportItems.includes(schemaFileName))
            exportItems.push(schemaFileName);
        // store included
        let includedItems = [];
        // check all schema file exists
        exportItems = exportItems.filter(fileName => {
            const fileExist = checkFileExists(getPathFromRoot(`src/app/request/schema/${fileName}.ts`));
            const shouldInclude = !includedItems.includes(fileName);
            if(fileExist && shouldInclude) includedItems.push(fileName);
            return fileExist && shouldInclude;
        });
        const importItems = exportItems.map(item => `import ${item} from "./${item}";`).join("\n");
        const indexing = `${importItems}\nexport default {${exportItems}}`;
        await writeFile(
            path.resolve(process.cwd(), "src/app/request/schema/index.ts"),
            indexing,
        );

        // inform to console
        console.info(
            "\t\x1b[32m%s\x1b[0m\n",
            `app/request/schema/${schemaFileName}.ts`,
        );

        return schemaFileName;
    }
};

/**
 * Make a policy
 * @param {{name:string, methods: string}} args
 * @returns
 */
const makePolicy = async (args) => {
    const { name, methods } = args;
    // check if name provided or not
    if (!name)
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:policy [name] is required. type -h --help for help",
        );

    const m =
    typeof methods === "string"
        ? methods.split(",")
        : Array.isArray(methods)
            ? methods
            : ["test"];
    const funDefinition = `/**
    * Method name should be the same as you want to apply
    * to the corresponding Controller method.
    * 
    * returning \`true\` will be considered as valid
    * otherwise return \`false\` or rejection message.
    * @returns boolean | string
    */\n@name(): boolean | string {
      return this.reject();
  }`;
    const className = /Policy/gi.test(name) ? name : name + "Policy";

    const template = `import { FastifyRequest } from "fastify";
    import Policy from "@supports/Policy";
    
    export default class ${className} extends Policy {
        
        constructor(request: FastifyRequest){
            super(request);
        }
        ${m.map((el) => funDefinition.replace("@name", el)).join("\n")}
    }`;
    const fname = getPathFromRoot(`src/app/policies/${className}.ts`);
    try {
        await fs.stat(fname);
        // if exist then go throw error
        return console.error(
            "\n\t\x1b[31m%s\x1b[0m\n",
            `'${className}' already exist.`,
        );
    } catch (error) {
        await writeFile(fname, template);
        return console.info(
            "\t\x1b[32m%s\x1b[0m\n",
            `app/policies/${className}.ts`,
        );
    }
};

/**
 * Make application notification
 * @param {{name:string}} args notification name
 * @returns
 */
const makeNotification = async (args) => {
    const { name } = args;
    // check if name provided or not
    if (!name)
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:notification [name] is required. type -h --help for help",
        );
    const template = readFileSync(
        path.resolve(__dirname, "./notification_schema.txt"),
        { encoding: "utf-8" },
    );
    if (checkFileExists(getPathFromRoot(`src/app/notifications/${name}.ts`))) {
        return console.error("\x1b[31m%s\x1b[0m", `${name} already exists.`);
    } else {
        await writeFile(
            getPathFromRoot(`src/app/notifications/${name}.ts`),
            template.replace(/@name/gi, name),
        );
        console.error("\x1b[33m%s\x1b[0m", `app/notifications/${name}.ts`);
    }
};

/**
 * Make application event
 * @param {{name:string}} args event name
 * @returns
 */
const makeEvent = async (args) => {
    const { name } = args;
    // check if name provided or not
    if (!name)
        return console.error(
            "\x1b[31m%s\x1b[0m",
            "node fs make:event [name] is required. type -h --help for help",
        );
    const template = readFileSync(path.resolve(__dirname, "./event_schema.txt"), {
        encoding: "utf-8",
    });
    if (checkFileExists(getPathFromRoot(`src/app/events/${name}.ts`))) {
        return console.error("\x1b[31m%s\x1b[0m", `${name} already exists.`);
    } else {
        await writeFile(
            getPathFromRoot(`src/app/events/${name}.ts`),
            template.replace(/@name/gi, name),
        );
        console.error("\x1b[33m%s\x1b[0m", `app/events/${name}.ts`);
    }
};

/**
 * List the application routes
 */
const routeList = async () => {
    const tsNodePath = path.resolve(process.cwd(), "./node_modules/.bin/ts-node");
    exec(
        tsNodePath +
      " -r tsconfig-paths/register -e 'import Server from \"./src/core/Server\"; console.table(Server.initApplication().initServer().application.routes.map(r => { const {schema, ...rest} = r; return rest; }))'",
        (e, o, er) => {
            e && console.log(e);
            er && console.log(er);
            console.log(o);
        },
    );
    // exec(tsNodePath + " -e 'import Server from \"./src/core/Server\"; Server.initApplication().initServer().printRoutes();'", (e,o,err) => {
    //   console.log(o);
    // })
};

/**
 * Create symlink from storage to public
 */
const linkDir = () => {
    const storagePath = getPathFromRoot("src/storage/public");
    const publicPath = getPathFromRoot("src/public");
    exec(`ls -s ${storagePath} ${publicPath}`, (e, o, err) => {
        e && console.error(e);
        err && console.error(err);
        console.info(o);
    });
};

/**
 * Compile the application
 */
const build = () => {
    const rimrafPath = getPathFromRoot("./node_modules/.bin/rimraf");
    const tscPath = getPathFromRoot("./node_modules/.bin/tsc");
    const tscPathsPath = getPathFromRoot("./node_modules/.bin/tscpaths");
    const { compilerOptions } = require(getPathFromRoot("./tsconfig.json"));
    const { outDir = "./dist", baseUrl = "./src" } = compilerOptions ?? {};

    exec(
        `${rimrafPath} ${outDir} && ${tscPath} && ${tscPathsPath} -p tsconfig.json -s ${baseUrl} -o ${outDir}`,
        async (e, o, err) => {
            e && console.error(e);
            err && console.error(err);
            console.log(o);
            await configureDist();
            console.info("Done!");
        },
    );
};

/**
 * Start development server and check watch
 */
const startDev = () => {
    nodemon().once("start", configureDev).on("restart", cacheRoutes);
};

/**
 * The entry point of the CLI tools
 */
async function main() {
    const args = yargs(hideBin(process.argv)).argv;
    const commandType = args._.length ? args._.shift() : null;
    const commandValue = args._.length ? args._.shift() : null;
    const needHelp = args.help || args.h;
    const commandData = { name: commandValue, ...args };

    // print help if needed
    if (needHelp || !commandType) return printHelp(commandType);

    // proceed the command
    switch (commandType) {
    case "make:model":
        return makeModel(commandData);
    case "make:controller":
        return makeController(commandData);
    case "make:schema":
        return makeSchema(commandData);
    case "make:policy":
        return makePolicy(commandData);
    case "make:notification":
        return makeNotification(commandData);
    case "make:event":
        return makeEvent(commandData);
    case "route:cache":
        return cacheRoutes();
    case "route:list":
        return routeList();
    case "storage:link":
        return linkDir();
    case "build":
        return build();
    case "dev":
        return startDev();
    case "start:dev":
        return startDev();
    case "serve":
        return startDev();
    default:
        return printMsg("TypeError: Unsupported command type");
    }
}

/**
 * Start the main function to init CLI
 */
main();
