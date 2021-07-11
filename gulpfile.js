const { accessSync, constants, readFileSync, writeFileSync } = require("fs");
const gulp = require("gulp"),
  gnodemon = require("gulp-nodemon"),
  yargs = require("yargs/yargs"),
  { hideBin } = require("yargs/helpers"),
  gulpCopy = require("gulp-copy"),
  dotenv = require("dotenv"),
  {
    cacheRoutes,
    printRoutes,
    makeController,
    makeModel,
    makeSchema,
    makePolicy,
    rMakeDir,
  } = require("./service");

gulp.task("route:cache", () => {
  return cacheRoutes();
});

gulp.task("route:list", () => {
  return printRoutes();
});

gulp.task("make:controller", () => {
  return makeController(yargs(hideBin(process.argv)).argv);
});

gulp.task("make:model", () => {
  return makeModel(yargs(hideBin(process.argv)).argv);
});

gulp.task("make:schema", () => {
  return makeSchema(yargs(hideBin(process.argv)).argv);
});

gulp.task("make:policy", () => {
  return makePolicy(yargs(hideBin(process.argv)).argv);
});

gulp.task("configure:dist", () => {
  copyDotEnvFile("./dist/.env");
  catchEnv("./dist/.env", "./dist/core/cache/env.json");
  copyPackageDotJson();
  rMakeDir("dist","/storage/log".split('/'));
  return gulp.src("src/public/*").pipe(gulpCopy("./dist/", { prefix: 1 }));
});

gulp.task("configure:dev", (done) => {
  if (!checkFileExists("./src/.env")) {
    copyDotEnvFile("./src/.env");
  }
  catchEnv("./src/.env", "./src/core/cache/env.json");
  done();
});

function copyPackageDotJson() {
  let data = require("./package.json"),
    { scripts, devDependencies, ...rest } = data,
    writeAbleData = JSON.stringify(
      { ...rest, scripts: { start: "node init.js", serve: "npm run start" } },
      null,
      "\t"
    );

  writeFileSync("./dist/package.json", writeAbleData);
}

function catchEnv(from, to) {
  if (checkFileExists(from)) {
    let data = dotenv.parse(readFileSync(from));
    writeFileSync(to, JSON.stringify(data, null, "\t"));
  } else {
    console.error("ENV file not found.");
  }
}

function copyDotEnvFile(to) {
  let dotenvPath = checkFileExists("./src/.env")
    ? "./src/.env"
    : checkFileExists("./src/.env.example")
    ? "./src/.env.example"
    : null;
  if (dotenvPath) {
    let data = readFileSync(dotenvPath, { encoding: "utf-8" });
    writeFileSync(to, data);
  } else {
    console.log("No ENV file ditected!");
  }
}

function checkFileExists(path) {
  let flag = true;
  try {
    accessSync(path, constants.F_OK);
  } catch (e) {
    flag = false;
  }
  return flag;
}

gulp.task("start", () => {
  gnodemon()
    .on("start", ["configure:dev", "route:cache"])
    .on("restart", ["route:cache"]);
});
