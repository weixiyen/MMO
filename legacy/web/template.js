var path = require('path'),
    fs = require('fs');
    _ = require('./underscore')._;

var template_obj = [];

function compileTemplates(dir) {
  var tmpl_path = path.join(process.cwd(), dir + '/'),
      templates = fs.readdirSync(tmpl_path);
  for (var i=0; i < templates.length; i++) {
      if (templates[i].substr(templates[i].length-5) === '.html') {
        template_obj[dir + '/' + templates[i]] = fs.readFileSync(tmpl_path + templates[i]);
      } else {
        compileTemplates(dir + '/' + templates[i]);
      }
  }
}

compileTemplates('templates');

this.render = function(tmpl_path, tmpl_vars) {
    var template = _.template(template_obj['templates/'+tmpl_path].toString());
    return template(tmpl_vars);
};