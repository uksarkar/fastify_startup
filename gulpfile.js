const gulp = require('gulp'),
        gnodemon = require('gulp-nodemon'),
        yargs = require('yargs/yargs'),
        { hideBin } = require('yargs/helpers'),
        {cacheRoutes, printRoutes, makeController, makeModel, makeSchema} = require('./service')

gulp.task('route:cache', () => {
    return cacheRoutes();
})

gulp.task('route:list', () => {
    return printRoutes();
})

gulp.task('make:controller', () => {
    return makeController(yargs(hideBin(process.argv)).argv);
})

gulp.task('make:model', () => {
    return makeModel(yargs(hideBin(process.argv)).argv);
})

gulp.task('make:schema', () => {
    return makeSchema(yargs(hideBin(process.argv)).argv);
})

gulp.task('start', () => {
    gnodemon(require('./nodemon.json')).on('start',['route:cache']).on('restart',['route:cache']);
})