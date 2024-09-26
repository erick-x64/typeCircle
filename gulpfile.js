const { task, src, dest, series } = require('gulp');
const postcss = require('gulp-postcss');
const combineSelectors = require('postcss-combine-duplicated-selectors');
const presetEnv = require('postcss-preset-env');
const sorting = require('postcss-sorting');
const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');

task('css', function () {
    const plugins = [
        purgecss({
            content: ['frontend/src/app/**/*.html'],
            safelist: {
                tags: ['img'],
                standard: [':host']
            }
        }),
        combineSelectors({
            removeDuplicatedProperties: true
        }),
        presetEnv({
            stage: 1
        }),
        autoprefixer(),
        sorting({
            "order": [
                "custom-properties",
                "dollar-variables",
                "declarations",
                "rules",
                "at-rules"
            ],
            "properties-order": "alphabetical"
        }),
    ];
    return src([
        'frontend/src/app/**/*.css',
        '!frontend/src/app/assets/**'
    ])
        .pipe(postcss(plugins))
        .pipe(dest('dist'));
});

task('default', series('css'));
