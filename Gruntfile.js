module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
          //grunt task configuration will go here

        ngAnnotate: {
          options: {
            singleQuotes: true,
            expand: true
          },
          app: {
            files: {
              './app/js/core/min/core.js': ['./app/js/core/core.js'],
              './app/js/core/min/auth.service.js': ['./app/js/core/auth.service.js'],
              './app/js/core/min/message.service.js': ['./app/js/core/message.service.js'],
              './app/js/core/min/settings.service.js': ['./app/js/core/settings.service.js'],
              './app/js/core/min/tokeninterceptor.service.js': ['./app/js/core/tokeninterceptor.service.js'],
            }
          }
        },

        concat: {
          js: { //target
            src: ['./app/js/core/min/core.js','./app/js/core/min/*.js'],
            dest: './app/js/core/min/core.js'
          }
        },
        uglify: {
          js: { //target
            src: ['./app/js/core/min/core.js'],
            dest: './app/js/core/min/core.js'
          },
          options: {
            report: 'min',
            mangle: true,
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            beautifier: true
          }
        }

    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');

    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'uglify']);
}
