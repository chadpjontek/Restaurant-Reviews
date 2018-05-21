module.exports = function (grunt) {
  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: "gm",
          sizes: [
            { name: "400", quality: 60, width: 400 },
            { name: "600", quality: 60, width: 600 },
            { name: "800", quality: 60, width: 800 },
          ]
        },
        files: [
          {
            expand: true,
            src: ["*.{jpg,png}"],
            cwd: "src/",
            dest: "img/"
          }
        ]
      }
    }
  });
  grunt.loadNpmTasks("grunt-responsive-images");
  grunt.registerTask("default", ["responsive_images"]);
};