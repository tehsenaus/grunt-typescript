module.exports = function (grunt) {
    "use strict";

    var fs = require("fs"),
        path = require("path"),
        cp = require('child_process'),
        Q = require('q');

    grunt.initConfig({
        clean:{
            test:[
                "test/fixtures/**/*.js",
                "test/fixtures/**/*.js.map",
                "test/fixtures/**/*.d.ts",
                "test/temp/**/*.*",
                "test/temp"
            ],
            expect: "test/expected",
            watch: "test/watch/fixtures/**/*.*"
        },
        typescript:{
            simple:{
                src: ["test/fixtures/simple.ts"],
                options:{
                }
            },
            declaration:{
                src:"test/fixtures/declaration.ts",
                options:{
                    declaration:true
                }
            },
            sourcemap:{
                src:"test/fixtures/sourcemap.ts",
                dest:"test/fixtures/sourcemap/",
                options:{
                    basePath: "test/fixtures/",
                    sourceMap:true
                }
            },
            dest:{
                src:"test/fixtures/dest.ts",
                dest: "test/temp/dest",
                options:{
                    declaration: true,
                    basePath: "test/fixtures"
                }
            },
            single:{
                src:"test/fixtures/single/**/*.ts",
                dest: "test/temp/single.js"
            },
            es5:{
                src:"test/fixtures/es5.ts",
                options:{
                    target:"ES5"
                }
            },
            amd:{
                src:"test/fixtures/amd.ts",
                options:{
                    module:"amd"
                }
            },
            commonjs:{
                src:"test/fixtures/commonjs.ts",
                options:{
                    module:"commonjs"
                }
            },
            "single-sourcemap":{
                src:"test/fixtures/single/**/*.ts",
                dest: "test/temp/single-sourcemap.js",
                options:{
                    sourceMap: true
                }
            },
            multi:{
                src:"test/fixtures/multi/**/*.ts",
                dest:"test/temp/multi"
            },
            basePath:{
                src:"test/fixtures/multi/**/*.ts",
                dest:"test/temp/basePath",
                options: {
                    basePath: "test/fixtures/multi"
                }
            },
            "utf8-with-bom":{
                src:"test/fixtures/utf8-with-bom.ts"
            },
            "no-output":{
                //存在しないファイル
                src:"text/fixtures/no-output.ts",
                dest:"test/temp/no-output.js"
            },
            comments:{
                src:"test/fixtures/comments.ts",
                options:{
                    comments:true
                }
            },
            noImplicitAny:{
                src:"test/fixtures/noImplicitAny.ts",
                options:{
                    ignoreError: true,
                    noImplicitAny: true
                }
            },
            noImplicitAny2:{
                src:"test/fixtures/noImplicitAny2.ts",
                options:{
                    ignoreError: true,
                    noImplicitAny: true
                }
            },
            newline_lf: {
                src:"test/fixtures/newline.ts",
                dest: "test/fixtures/newline_lf.js",
                options:{
                    //ignoreTypeCheck: false,
                    newLine: "lf"
                }
            },
            newline_crlf: {
                src:"test/fixtures/newline.ts",
                dest: "test/fixtures/newline_crlf.js",
                options:{
                    //ignoreTypeCheck: false,
                    newLine: "crlf"
                }
            },
            newline_auto: {
                src:"test/fixtures/newline.ts",
                dest: "test/fixtures/newline_auto.js",
                options:{
                    //ignoreTypeCheck: false,
                    newLine: "auto"
                }
            },
            useTabIndent: {
                src:"test/fixtures/useTabIndent.ts",
                dest: "test/fixtures/useTabIndent.js",
                options:{
                    useTabIndent: true
                }
            },
            indentStep0: {
                src:"test/fixtures/indentStep.ts",
                dest: "test/fixtures/indentStep_0.js",
                options:{
                    indentStep: 0
                }
            },
            priorityUseTabIndent: {
                src:"test/fixtures/indentStep.ts",
                dest: "test/fixtures/indentStep_2.js",
                options:{
                    indentStep: 2
                }
            },
            indentStep2: {
                src:"test/fixtures/useTabIndent.ts",
                dest: "test/fixtures/useTabIndent_priority.js",
                options:{
                    useTabIndent: true,
                    indentStep: 2
                }
            },
            resolve: {
                src:"test/fixtures/resolve/resolve1.ts",
                options:{
                    noResolve: true,
                    ignoreError: true
                }
            }
            , errortypecheck: {
                src: "test/fixtures/error-typecheck.ts",
                options: {
                    ignoreError: true
                }
            }
            , watch:{
                src: "test/watch/fixtures/**/*.ts",
                options: {
                    watch: {
                        path: "test/watch/fixtures"
                        //atBegin: true
                    }
                }
            }
            , watchSingle:{
                src: "test/watch/fixtures/**/*.ts",
                dest: "test/watch/fixtures/watchSingle.js",
                options: {
                    watch: {
                        path: "test/watch/fixtures"
                        //atBegin: true
                    }
                }
            }


//            , errorsyntax:{
//                src: "test/fixtures/error-syntax.ts",
//                options: {
//                    ignoreTypeCheck: false
//                    //noResolve: true
//                }
//            }
        },
        nodeunit:{
            tests:["test/test.js"]
        },
        switchv:{
            "100": {
                options: {version: "1.0.0"}
            },
            "101": {
                options:{version: "1.0.1"}
            }
        }
    });

    grunt.loadTasks("tasks");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-contrib-clean");

    function getTestTsTasks(){
        var results = [];
        results.push("clean:test");

        var tsConfig = grunt.config.getRaw("typescript");
        for(var p in tsConfig){
            if(!tsConfig.hasOwnProperty(p)){
                continue;
            }
            if(p.substr(0,5) === "watch"){
                continue;
            }
            results.push("typescript:" + p);
        }
        results.push("nodeunit");
        return results;
    }

    grunt.registerTask("test", getTestTsTasks()); //["clean:test", "typescript", "nodeunit"]);
    grunt.registerTask("default", ["test"]);

    grunt.registerMultiTask("switchv", "switch typescript version", function(){
        var version = this.options({}).version,
            targetDir = "lib/" + version;
        grunt.file.copy(targetDir + "/lib.d.ts", "node_modules/typescript/bin/lib.d.ts");
        grunt.file.copy(targetDir + "/typescript.js", "node_modules/typescript/bin/typescript.js");
        grunt.file.copy(targetDir + "/typescript.d.ts", "typings/typescript/typescript.d.ts");
    });

    function tsc(option){
        var command = "node " + path.resolve(path.dirname(require.resolve("typescript")), "tsc ");

        return Q.promise(function(resolve, reject){
            var childProcess = cp.exec(command + option, {});
            childProcess.stdout.on('data', function (d) { grunt.log.writeln(d); });
            childProcess.stderr.on('data', function (d) { grunt.log.error(d); });

            childProcess.on('exit', function(code) {
                if (code !== 0) {
                    reject();
                }
                resolve();
            });
        });
    }

    grunt.registerTask('egen', 'Genereate test expected files.', function() {
        var done = this.async();

        grunt.file.mkdir("test/expected/multi/dir");
        grunt.file.mkdir("test/expected/single");
        grunt.file.mkdir("test/expected/sourcemap");

        grunt.log.writeln("Simple");
        tsc("test/fixtures/simple.ts").then(function(){
            grunt.file.copy("test/fixtures/simple.js", "test/expected/simple.js");

            grunt.log.writeln("Declaration");
            return tsc("test/fixtures/declaration.ts --declaration");
        }).then(function(){
            grunt.file.copy("test/fixtures/declaration.js", "test/expected/declaration.js");
            grunt.file.copy("test/fixtures/declaration.d.ts", "test/expected/declaration.d.ts");

            grunt.log.writeln("Sourcemap");
            return tsc("test/fixtures/sourcemap.ts --outDir test/fixtures/sourcemap --sourcemap");
        }).then(function(){
            grunt.file.copy("test/fixtures/sourcemap/sourcemap.js","test/expected/sourcemap/sourcemap.js");
            grunt.file.copy("test/fixtures/sourcemap/sourcemap.js.map", "test/expected/sourcemap/sourcemap.js.map");

            grunt.log.writeln("Target ES5");
            return tsc("test/fixtures/es5.ts --target ES5");
        }).then(function(){
            grunt.file.copy("test/fixtures/es5.js", "test/expected/es5.js");

            grunt.log.writeln("AMD");
            return tsc("test/fixtures/amd.ts --module amd");
        }).then(function(){
            grunt.file.copy("test/fixtures/amd.js", "test/expected/amd.js");

            grunt.log.writeln("CommonJS");
            return tsc("test/fixtures/commonjs.ts --module commonjs");
        }).then(function(){
            grunt.file.copy("test/fixtures/commonjs.js", "test/expected/commonjs.js");

            grunt.log.writeln("Single");
            return tsc("test/fixtures/single/dir/single2.ts test/fixtures/single/single1.ts --out test/temp/single.js");
        }).then(function(){
            grunt.file.copy("test/temp/single.js", "test/expected/single/single.js");

            grunt.log.writeln("Single-SourceMap");
            return tsc("test/fixtures/single/dir/single2.ts test/fixtures/single/single1.ts --out test/temp/single-sourcemap.js --sourcemap");
        }).then(function(){
            grunt.file.copy("test/temp/single-sourcemap.js", "test/expected/single/single-sourcemap.js");
            grunt.file.copy("test/temp/single-sourcemap.js.map", "test/expected/single/single-sourcemap.js.map");

            grunt.log.writeln("Multi");
            return tsc("test/fixtures/multi/multi1.ts --outDir test/temp/multi").then(function(){
                return tsc("test/fixtures/multi/dir/multi2.ts --outDir test/temp/multi/dir");
            });
        }).then(function(){
            grunt.file.copy("test/temp/multi/multi1.js", "test/expected/multi/multi1.js");
            grunt.file.copy("test/temp/multi/dir/multi2.js", "test/expected/multi/dir/multi2.js");

            grunt.log.writeln("BOM");
            return tsc("test/fixtures/utf8-with-bom.ts");
        }).then(function(){
            grunt.file.copy("test/fixtures/utf8-with-bom.js", "test/expected/utf8-with-bom.js");

            grunt.log.writeln("Comment");
            return tsc("test/fixtures/comments.ts");
        }).then(function(){
            grunt.file.copy("test/fixtures/comments.js", "test/expected/comments.js");

            grunt.log.writeln("NewLine");
            return tsc("test/fixtures/newline.ts");
        }).then(function(){
            grunt.file.copy("test/fixtures/newline.js", "test/expected/newline_auto.js");
            var val = grunt.file.read("test/fixtures/newline.js").toString();
            val = val.replace(/\r\n/g, "\n");
            grunt.file.write("test/expected/newline_lf.js", val);
            val = val.replace(/\n/g, "\r\n");
            grunt.file.write("test/expected/newline_crlf.js", val);

            grunt.log.writeln("UseTabIndent");
            return tsc("test/fixtures/useTabIndent.ts");
        }).then(function(){
            var val = grunt.file.read("test/fixtures/useTabIndent.js").toString();
            val = val.replace(/    /g, "\t");
            grunt.file.write("test/expected/useTabIndent.js", val);
            grunt.file.write("test/expected/useTabIndent_priority.js", val);

            grunt.log.writeln("IndentStep");
            return tsc("test/fixtures/indentStep.ts");
        }).then(function(){
            var val = grunt.file.read("test/fixtures/indentStep.js").toString();
            grunt.file.write("test/expected/indentStep_0.js", val.replace(/    /g, ""));
            grunt.file.write("test/expected/indentStep_2.js", val.replace(/    /g, "  "));

        }).then(function(){
            done(true);
        }).catch(function(){
            done(false);
        });
    });

    grunt.registerTask("build", "Build", function(){
        var done = this.async();
        tsc("src/modules/compiler.ts -m commonjs --noImplicitAny").then(function() {
            grunt.file.copy("src/modules/compiler.js", "tasks/modules/compiler.js");
            grunt.file.delete("src/modules/compiler.js");

            var files = fs.readdirSync("src").filter(function (file) {
                file = "src/" + file;

                return fs.statSync(file).isFile()
                    && /.*\.ts$/.test(file)
                    && !/compiler\.ts$/.test(file); //絞り込み
            }).map(function (file) {
                return "src" + path.sep + file;
            }).join(" ");
            return tsc(files + " --noImplicitAny --out tasks/typescript.js");
        }).then(function(){
            done(true);
        }).catch(function(){
            done(false);
        });
    });

    grunt.registerTask("setup", ["clean", "switchv:101", "egen"]);


    grunt.registerTask("watchcheck", "check watch option", function(){
        var done = this.async();

        grunt.util.spawn({
            grunt: true,
            args: "clean:watch",
            opts: { stdio: 'inherit' }
        }, function (err, result, code) {

        });

         grunt.util.spawn({
            grunt: true,
            args: "typescript:watch",
            opts: { stdio: 'inherit' }
        }, function (err, result, code) {

        });

        Q.delay(2000).then(function(){
            return Q.delay(1000);
        }).then(function(){
            console.log("--create first file");
            grunt.file.copy("test/watch/templates/first.ts", "test/watch/fixtures/first.ts");
            return Q.delay(2000);
        }).then(function(){
            console.log("--create second file");
            grunt.file.copy("test/watch/templates/second.ts", "test/watch/fixtures/second.ts");
            return Q.delay(2000);
        }).then(function(){
            console.log("--remove first file");
            grunt.file.delete("test/watch/fixtures/first.ts");
            return Q.delay(2000);
        }).then(function(){
            console.log("--update second file");
            grunt.file.write("test/watch/fixtures/second.ts", grunt.file.read("test/watch/templates/second_comp.ts"));
            return Q.delay(2000);
        }).done(function(){
            done();
        });
    });

    grunt.registerTask("watchscheck", "check watch option - singlefile", function(){
        var done = this.async();

        grunt.util.spawn({
            grunt: true,
            args: "clean:watch",
            opts: { stdio: 'inherit' }
        }, function (err, result, code) {

        });

        grunt.util.spawn({
            grunt: true,
            args: "typescript:watchSingle",
            opts: { stdio: 'inherit' }
        }, function (err, result, code) {

        });

        Q.delay(2000).then(function(){
            return Q.delay(1000);
        }).then(function(){
            console.log("--create first file");
            grunt.file.copy("test/watch/templates/first.ts", "test/watch/fixtures/first.ts");
            return Q.delay(2000);
        }).then(function(){
            console.log("--create second file");
            grunt.file.copy("test/watch/templates/second.ts", "test/watch/fixtures/second.ts");
            return Q.delay(2000);
        }).then(function(){
            console.log("--update second file");
            grunt.file.write("test/watch/fixtures/second.ts", grunt.file.read("test/watch/templates/second_comp.ts"))
            return Q.delay(2000);
        }).done(function(){

            var  result = grunt.file.read("test/watch/fixtures/watchSingle.js").toString() ===
                grunt.file.read("test/watch/expect/watchSingle.js").toString();

            console.log("-- expect: " + result);

            done();
        });
    });

    grunt.registerTask("watchtest", ["clean:watch", "watchcheck"]);
};
