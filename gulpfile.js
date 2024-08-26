import { task, src, dest, series } from 'gulp';
import postcss from 'gulp-postcss';
import combineSelectors from 'postcss-combine-duplicated-selectors';
import presetEnv from 'postcss-preset-env';
import sorting from 'postcss-sorting';
import autoprefixer from 'autoprefixer';
import purgecss from '@fullhuman/postcss-purgecss';

task('css', function () {
    const plugins = [
        purgecss({
            content: ['frontend/src/app/**/*.html'],
            safelist: {
                tags: ['img']
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
