(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = window;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(file.content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    return function(path) {
      var otherPackage;
      if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
  };

  if (typeof exports !== "undefined" && exports !== null) {
    exports.generateFor = generateRequireFn;
  } else {
    global.Require = {
      generateFor: generateRequireFn
    };
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

}).call(this);

//# sourceURL=main.coffee
  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2015 Daniel X Moore\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.md": {
      "path": "README.md",
      "content": "# Miki\n\nA markdown wiki type thing.\n",
      "mode": "100644",
      "type": "blob"
    },
    "main.coffee": {
      "path": "main.coffee",
      "content": "global.markdown = marked\n\nabsolute = new RegExp('^[a-z]+:|^//', 'i')\n\n# TODO: We'll want to load the file, then load a relative .css and .js\n\nbasePath = []\n{normalizePath} = require \"./lib/path\"\n\n# Attach a handler to document to intercept link clicks and\n# render relative files and update the current path.\ndocument.addEventListener \"click\", (e) ->\n  target = e.target\n  if target.nodeName is \"A\"\n    href = target.getAttribute \"href\"\n\n    unless absolute.test(href)\n      e.preventDefault()\n      # TODO: Load relative file\n      console.log href\n\n      path = normalizePath(href.split('/'), basePath)\n      self.invokeRemote \"system\", \"readFile\", path.join('/')\n      .then (file) ->\n        self.loadFile file\n      .catch (e) ->\n        console.error e\n\nreadAsText = (blob) ->\n  new Promise (resolve, reject) ->\n    reader = new FileReader()\n\n    reader.onloadend = ->\n      resolve(reader.result)\n    reader.onerror = reject\n    reader.readAsText(blob)\n\nself = global.miki =\n  render: (markdownText) ->\n    html = marked markdownText\n\n    document.body.innerHTML = html\n\n  loadFile: (file) ->\n    console.log file\n\n    readAsText(file)\n    .then (text) ->\n      self.render(text)\n\n  # We need to implement saveState and restoreState if we want to be able to\n  # persist across popping the window in and out.\n  saveState: ->\n    \n\n  restoreState: (state) ->\n    # TODO: Need to set currentPath\n    # need load base css and js\n\n  focus: ->\n    self.invokeRemote \"focus\"\n\n# -------------------------------------------------\n# From here on down is our Whimsy.space integration\nPostmaster = require(\"postmaster\")\nPostmaster({}, self)\n\n# Apps must call childLoaded if they want to receive state/file data from OS\nself.invokeRemote \"childLoaded\"\n\n# whimsy-file may return the link to the file data as a URL so we need to be\n# able to download the contents\nAjax = require \"./lib/ajax\"\n\nwindow.addEventListener \"mousedown\", ->\n  self.focus()\n\nprocessDropAsText = (e) ->\n  jsonText = e.dataTransfer.getData(\"application/whimsy-file+json\")\n  if jsonText\n    fileData = JSON.parse(jsonText)\n\n    {content, url, path, type} = fileData\n\n    if content\n      Promise.resolve content\n    else if url\n      Ajax.getText(url)\n  else\n    file = e.dataTransfer.files[0]\n    readAsText(file)\n\n# Handle File Drops\ndropReader = require \"./lib/drop\"\ndropReader document, (e) ->\n  processDropAsText(e)\n  .then self.render\n",
      "mode": "100644"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "version: \"0.0.1\"\nremoteDependencies: [\n  \"https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js\"\n]\ndependencies:\n  postmaster: \"distri/postmaster:v0.4.0-pre.0\"\n",
      "mode": "100644"
    },
    "lib/ajax.coffee": {
      "path": "lib/ajax.coffee",
      "content": "module.exports = Ajax =\n  getJSON: (path, options={}) ->\n    Ajax.getText(path, options)\n    .then JSON.parse\n\n  getText: (path, options) ->\n    Ajax.getBlob(path, options)\n    .then (blob) ->\n      new Promise (resolve, reject) ->\n        reader = new FileReader()\n\n        reader.onloadend = ->\n          resolve(reader.result)\n        reader.onerror = reject\n        reader.readAsText(blob)\n\n  getBlob: (path, options={}) ->\n    new Promise (resolve, reject) ->\n\n      xhr = new XMLHttpRequest()\n      xhr.open('GET', path, true)\n      xhr.responseType = \"blob\"\n\n      headers = options.headers\n      if headers\n        Object.keys(headers).forEach (header) ->\n          value = headers[header]\n          xhr.setRequestHeader header, value\n\n      xhr.onload = (e) ->\n        if (200 <= this.status < 300) or this.status is 304\n          try\n            resolve this.response\n          catch error\n            reject error\n        else\n          reject e\n\n      xhr.onerror = reject\n      xhr.send()\n",
      "mode": "100644"
    },
    "lib/drop.coffee": {
      "path": "lib/drop.coffee",
      "content": "module.exports = (element, handler) ->\n  cancel = (e) ->\n    e.preventDefault()\n    return false\n\n  element.addEventListener \"dragover\", cancel\n  element.addEventListener \"dragenter\", cancel\n  element.addEventListener \"drop\", (e) ->\n    e.preventDefault()\n    handler(e)\n    return false\n",
      "mode": "100644"
    },
    "lib/path.coffee": {
      "path": "lib/path.coffee",
      "content": "module.exports =\n  normalizePath: (path, base=[]) ->\n    base = base.concat path\n    result = []\n\n    while base.length\n      switch piece = base.shift()\n        when \"..\"\n          result.pop()\n        when \"\", \".\"\n          # Skip\n        else\n          result.push(piece)\n\n    return result\n",
      "mode": "100644"
    }
  },
  "distribution": {
    "main": {
      "path": "main",
      "content": "(function() {\n  var Ajax, Postmaster, absolute, basePath, dropReader, normalizePath, processDropAsText, readAsText, self;\n\n  global.markdown = marked;\n\n  absolute = new RegExp('^[a-z]+:|^//', 'i');\n\n  basePath = [];\n\n  normalizePath = require(\"./lib/path\").normalizePath;\n\n  document.addEventListener(\"click\", function(e) {\n    var href, path, target;\n    target = e.target;\n    if (target.nodeName === \"A\") {\n      href = target.getAttribute(\"href\");\n      if (!absolute.test(href)) {\n        e.preventDefault();\n        console.log(href);\n        path = normalizePath(href.split('/'), basePath);\n        return self.invokeRemote(\"system\", \"readFile\", path.join('/')).then(function(file) {\n          return self.loadFile(file);\n        })[\"catch\"](function(e) {\n          return console.error(e);\n        });\n      }\n    }\n  });\n\n  readAsText = function(blob) {\n    return new Promise(function(resolve, reject) {\n      var reader;\n      reader = new FileReader();\n      reader.onloadend = function() {\n        return resolve(reader.result);\n      };\n      reader.onerror = reject;\n      return reader.readAsText(blob);\n    });\n  };\n\n  self = global.miki = {\n    render: function(markdownText) {\n      var html;\n      html = marked(markdownText);\n      return document.body.innerHTML = html;\n    },\n    loadFile: function(file) {\n      console.log(file);\n      return readAsText(file).then(function(text) {\n        return self.render(text);\n      });\n    },\n    saveState: function() {},\n    restoreState: function(state) {},\n    focus: function() {\n      return self.invokeRemote(\"focus\");\n    }\n  };\n\n  Postmaster = require(\"postmaster\");\n\n  Postmaster({}, self);\n\n  self.invokeRemote(\"childLoaded\");\n\n  Ajax = require(\"./lib/ajax\");\n\n  window.addEventListener(\"mousedown\", function() {\n    return self.focus();\n  });\n\n  processDropAsText = function(e) {\n    var content, file, fileData, jsonText, path, type, url;\n    jsonText = e.dataTransfer.getData(\"application/whimsy-file+json\");\n    if (jsonText) {\n      fileData = JSON.parse(jsonText);\n      content = fileData.content, url = fileData.url, path = fileData.path, type = fileData.type;\n      if (content) {\n        return Promise.resolve(content);\n      } else if (url) {\n        return Ajax.getText(url);\n      }\n    } else {\n      file = e.dataTransfer.files[0];\n      return readAsText(file);\n    }\n  };\n\n  dropReader = require(\"./lib/drop\");\n\n  dropReader(document, function(e) {\n    return processDropAsText(e).then(self.render);\n  });\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"version\":\"0.0.1\",\"remoteDependencies\":[\"https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js\"],\"dependencies\":{\"postmaster\":\"distri/postmaster:v0.4.0-pre.0\"}};",
      "type": "blob"
    },
    "lib/ajax": {
      "path": "lib/ajax",
      "content": "(function() {\n  var Ajax;\n\n  module.exports = Ajax = {\n    getJSON: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return Ajax.getText(path, options).then(JSON.parse);\n    },\n    getText: function(path, options) {\n      return Ajax.getBlob(path, options).then(function(blob) {\n        return new Promise(function(resolve, reject) {\n          var reader;\n          reader = new FileReader();\n          reader.onloadend = function() {\n            return resolve(reader.result);\n          };\n          reader.onerror = reject;\n          return reader.readAsText(blob);\n        });\n      });\n    },\n    getBlob: function(path, options) {\n      if (options == null) {\n        options = {};\n      }\n      return new Promise(function(resolve, reject) {\n        var headers, xhr;\n        xhr = new XMLHttpRequest();\n        xhr.open('GET', path, true);\n        xhr.responseType = \"blob\";\n        headers = options.headers;\n        if (headers) {\n          Object.keys(headers).forEach(function(header) {\n            var value;\n            value = headers[header];\n            return xhr.setRequestHeader(header, value);\n          });\n        }\n        xhr.onload = function(e) {\n          var error, _ref;\n          if (((200 <= (_ref = this.status) && _ref < 300)) || this.status === 304) {\n            try {\n              return resolve(this.response);\n            } catch (_error) {\n              error = _error;\n              return reject(error);\n            }\n          } else {\n            return reject(e);\n          }\n        };\n        xhr.onerror = reject;\n        return xhr.send();\n      });\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/drop": {
      "path": "lib/drop",
      "content": "(function() {\n  module.exports = function(element, handler) {\n    var cancel;\n    cancel = function(e) {\n      e.preventDefault();\n      return false;\n    };\n    element.addEventListener(\"dragover\", cancel);\n    element.addEventListener(\"dragenter\", cancel);\n    return element.addEventListener(\"drop\", function(e) {\n      e.preventDefault();\n      handler(e);\n      return false;\n    });\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "lib/path": {
      "path": "lib/path",
      "content": "(function() {\n  module.exports = {\n    normalizePath: function(path, base) {\n      var piece, result;\n      if (base == null) {\n        base = [];\n      }\n      base = base.concat(path);\n      result = [];\n      while (base.length) {\n        switch (piece = base.shift()) {\n          case \"..\":\n            result.pop();\n            break;\n          case \"\":\n          case \".\":\n            break;\n          default:\n            result.push(piece);\n        }\n      }\n      return result;\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "http://www.danielx.net/editor/"
  },
  "version": "0.0.1",
  "entryPoint": "main",
  "remoteDependencies": [
    "https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js"
  ],
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "STRd6/miki",
    "homepage": null,
    "description": "",
    "html_url": "https://github.com/STRd6/miki",
    "url": "https://api.github.com/repos/STRd6/miki",
    "publishBranch": "gh-pages"
  },
  "dependencies": {
    "postmaster": {
      "source": {
        "LICENSE": {
          "path": "LICENSE",
          "content": "The MIT License (MIT)\n\nCopyright (c) 2013 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
          "mode": "100644",
          "type": "blob"
        },
        "README.md": {
          "path": "README.md",
          "content": "postmaster\n==========\n\nSend and receive `postMessage` commands using promises to handle the results.\n",
          "mode": "100644",
          "type": "blob"
        },
        "main.coffee": {
          "path": "main.coffee",
          "content": "###\n\nPostmaster wraps the `postMessage` API with promises.\n\n###\n\ndefaultReceiver = self\nackTimeout = 1000\n\nmodule.exports = Postmaster = (I={}, self={}) ->\n  send = (data) ->\n    target = self.remoteTarget()\n    if !Worker? or target instanceof Worker\n      target.postMessage data\n    else\n      target.postMessage data, \"*\"\n\n  dominant = Postmaster.dominant()\n  self.remoteTarget ?= -> dominant\n  self.receiver ?= -> defaultReceiver\n  self.ackTimeout ?= -> ackTimeout\n\n  self.receiver().addEventListener \"message\", (event) ->\n    # Only listening to messages from `opener`\n    if event.source is self.remoteTarget() or !event.source\n      data = event.data\n      {type, method, params, id} = data\n\n      switch type\n        when \"ack\"\n          pendingResponses[id]?.ack = true\n        when \"response\"\n          pendingResponses[id].resolve data.result\n        when \"error\"\n          pendingResponses[id].reject data.error\n        when \"message\"\n          send\n            type: \"ack\"\n            id: id\n\n          Promise.resolve()\n          .then ->\n            self[method](params...)\n          .then (result) ->\n            send\n              type: \"response\"\n              id: id\n              result: result\n          .catch (error) ->\n            if typeof error is \"string\"\n              message = error\n            else\n              message = error.message\n\n            send\n              type: \"error\"\n              id: id\n              error:\n                message: message\n                stack: error.stack\n\n  pendingResponses = {}\n  remoteId = 0\n\n  self.invokeRemote = (method, params...) ->\n    id = remoteId++\n\n    send\n      type: \"message\"\n      method: method\n      params: params\n      id: id\n\n    new Promise (resolve, reject) ->\n      clear = ->\n        clearTimeout pendingResponses[id].timeout\n        delete pendingResponses[id]\n\n      ackWait = self.ackTimeout()\n      timeout = setTimeout ->\n        pendingResponse = pendingResponses[id]\n        if pendingResponse and !pendingResponse.ack\n          clear()\n          reject new Error \"No ack received within #{ackWait}\"\n      , ackWait\n\n      pendingResponses[id] =\n        timeout: timeout\n        resolve: (result) ->\n          clear()\n          resolve(result)\n        reject: (error) ->\n          clear()\n          reject(error)\n\n  return self\n\nPostmaster.dominant = ->\n  if window? # iframe or child window context\n    opener or ((parent != window) and parent) or undefined\n  else # Web Worker Context\n    self\n\nreturn Postmaster\n",
          "mode": "100644",
          "type": "blob"
        },
        "pixie.cson": {
          "path": "pixie.cson",
          "content": "version: \"0.4.0-pre.0\"\n",
          "mode": "100644",
          "type": "blob"
        },
        "test/postmaster.coffee": {
          "path": "test/postmaster.coffee",
          "content": "Postmaster = require \"../main\"\n\nscriptContent = ->\n  fn = ->\n    pm = Postmaster()\n    pm.echo = (value) ->\n      return value\n    pm.throws = ->\n      throw new Error(\"This always throws\")\n    pm.promiseFail = ->\n      Promise.reject new Error \"This is a failed promise\"\n\n  \"\"\"\n    var module = {};\n    Postmaster = #{PACKAGE.distribution.main.content};\n    (#{fn.toString()})();\n  \"\"\"\n\ninitWindow = (targetWindow) ->\n  targetWindow.document.write \"<script>#{scriptContent()}<\\/script>\"\n\ndescribe \"Postmaster\", ->\n  it \"should work with openened windows\", (done) ->\n    childWindow = open(\"\", null, \"width=200,height=200\")\n\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .then (result) ->\n      assert.equal result, 5\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      childWindow.close()\n\n  it \"should work with iframes\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n  it \"should handle the remote call throwing errors\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"throws\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n  it \"should handle the remote call returning failed promises\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"promiseFail\"\n    .catch (error) ->\n      done()\n    .then ->\n      iframe.remove()\n\n  it \"should be able to go around the world\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    initWindow(childWindow)\n\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.yolo = (txt) ->\n      \"heyy #{txt}\"\n    postmaster.invokeRemote \"invokeRemote\", \"yolo\", \"cool\"\n    .then (result) ->\n      assert.equal result, \"heyy cool\"\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      iframe.remove()\n\n  it \"should work with web workers\", (done) ->\n    blob = new Blob [scriptContent()]\n    jsUrl = URL.createObjectURL(blob)\n\n    worker = new Worker(jsUrl)\n\n    base =\n      remoteTarget: -> worker\n      receiver: -> worker\n\n    postmaster = Postmaster({}, base)\n    postmaster.invokeRemote \"echo\", 17\n    .then (result) ->\n      assert.equal result, 17\n    .then ->\n      done()\n    , (error) ->\n      done(error)\n    .then ->\n      worker.terminate()\n\n  it \"should fail quickly when contacting a window that doesn't support Postmaster\", (done) ->\n    iframe = document.createElement('iframe')\n    document.body.appendChild(iframe)\n\n    childWindow = iframe.contentWindow\n    postmaster = Postmaster()\n    postmaster.remoteTarget = -> childWindow\n    postmaster.invokeRemote \"echo\", 5\n    .catch (e) ->\n      if e.message.match /no ack/i\n        done()\n      else\n        done(1)\n    .then ->\n      iframe.remove()\n",
          "mode": "100644",
          "type": "blob"
        }
      },
      "distribution": {
        "main": {
          "path": "main",
          "content": "\n/*\n\nPostmaster wraps the `postMessage` API with promises.\n */\n\n(function() {\n  var Postmaster, ackTimeout, defaultReceiver,\n    __slice = [].slice;\n\n  defaultReceiver = self;\n\n  ackTimeout = 1000;\n\n  module.exports = Postmaster = function(I, self) {\n    var dominant, pendingResponses, remoteId, send;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    send = function(data) {\n      var target;\n      target = self.remoteTarget();\n      if ((typeof Worker === \"undefined\" || Worker === null) || target instanceof Worker) {\n        return target.postMessage(data);\n      } else {\n        return target.postMessage(data, \"*\");\n      }\n    };\n    dominant = Postmaster.dominant();\n    if (self.remoteTarget == null) {\n      self.remoteTarget = function() {\n        return dominant;\n      };\n    }\n    if (self.receiver == null) {\n      self.receiver = function() {\n        return defaultReceiver;\n      };\n    }\n    if (self.ackTimeout == null) {\n      self.ackTimeout = function() {\n        return ackTimeout;\n      };\n    }\n    self.receiver().addEventListener(\"message\", function(event) {\n      var data, id, method, params, type, _ref;\n      if (event.source === self.remoteTarget() || !event.source) {\n        data = event.data;\n        type = data.type, method = data.method, params = data.params, id = data.id;\n        switch (type) {\n          case \"ack\":\n            return (_ref = pendingResponses[id]) != null ? _ref.ack = true : void 0;\n          case \"response\":\n            return pendingResponses[id].resolve(data.result);\n          case \"error\":\n            return pendingResponses[id].reject(data.error);\n          case \"message\":\n            send({\n              type: \"ack\",\n              id: id\n            });\n            return Promise.resolve().then(function() {\n              return self[method].apply(self, params);\n            }).then(function(result) {\n              return send({\n                type: \"response\",\n                id: id,\n                result: result\n              });\n            })[\"catch\"](function(error) {\n              var message;\n              if (typeof error === \"string\") {\n                message = error;\n              } else {\n                message = error.message;\n              }\n              return send({\n                type: \"error\",\n                id: id,\n                error: {\n                  message: message,\n                  stack: error.stack\n                }\n              });\n            });\n        }\n      }\n    });\n    pendingResponses = {};\n    remoteId = 0;\n    self.invokeRemote = function() {\n      var id, method, params;\n      method = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      id = remoteId++;\n      send({\n        type: \"message\",\n        method: method,\n        params: params,\n        id: id\n      });\n      return new Promise(function(resolve, reject) {\n        var ackWait, clear, timeout;\n        clear = function() {\n          clearTimeout(pendingResponses[id].timeout);\n          return delete pendingResponses[id];\n        };\n        ackWait = self.ackTimeout();\n        timeout = setTimeout(function() {\n          var pendingResponse;\n          pendingResponse = pendingResponses[id];\n          if (pendingResponse && !pendingResponse.ack) {\n            clear();\n            return reject(new Error(\"No ack received within \" + ackWait));\n          }\n        }, ackWait);\n        return pendingResponses[id] = {\n          timeout: timeout,\n          resolve: function(result) {\n            clear();\n            return resolve(result);\n          },\n          reject: function(error) {\n            clear();\n            return reject(error);\n          }\n        };\n      });\n    };\n    return self;\n  };\n\n  Postmaster.dominant = function() {\n    if (typeof window !== \"undefined\" && window !== null) {\n      return opener || ((parent !== window) && parent) || void 0;\n    } else {\n      return self;\n    }\n  };\n\n  return Postmaster;\n\n}).call(this);\n",
          "type": "blob"
        },
        "pixie": {
          "path": "pixie",
          "content": "module.exports = {\"version\":\"0.4.0-pre.0\"};",
          "type": "blob"
        },
        "test/postmaster": {
          "path": "test/postmaster",
          "content": "(function() {\n  var Postmaster, initWindow, scriptContent;\n\n  Postmaster = require(\"../main\");\n\n  scriptContent = function() {\n    var fn;\n    fn = function() {\n      var pm;\n      pm = Postmaster();\n      pm.echo = function(value) {\n        return value;\n      };\n      pm.throws = function() {\n        throw new Error(\"This always throws\");\n      };\n      return pm.promiseFail = function() {\n        return Promise.reject(new Error(\"This is a failed promise\"));\n      };\n    };\n    return \"var module = {};\\nPostmaster = \" + PACKAGE.distribution.main.content + \";\\n(\" + (fn.toString()) + \")();\";\n  };\n\n  initWindow = function(targetWindow) {\n    return targetWindow.document.write(\"<script>\" + (scriptContent()) + \"<\\/script>\");\n  };\n\n  describe(\"Postmaster\", function() {\n    it(\"should work with openened windows\", function(done) {\n      var childWindow, postmaster;\n      childWindow = open(\"\", null, \"width=200,height=200\");\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 5).then(function(result) {\n        return assert.equal(result, 5);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return childWindow.close();\n      });\n    });\n    it(\"should work with iframes\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call throwing errors\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"throws\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should handle the remote call returning failed promises\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"promiseFail\")[\"catch\"](function(error) {\n        return done();\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should be able to go around the world\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      initWindow(childWindow);\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      postmaster.yolo = function(txt) {\n        return \"heyy \" + txt;\n      };\n      return postmaster.invokeRemote(\"invokeRemote\", \"yolo\", \"cool\").then(function(result) {\n        return assert.equal(result, \"heyy cool\");\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n    it(\"should work with web workers\", function(done) {\n      var base, blob, jsUrl, postmaster, worker;\n      blob = new Blob([scriptContent()]);\n      jsUrl = URL.createObjectURL(blob);\n      worker = new Worker(jsUrl);\n      base = {\n        remoteTarget: function() {\n          return worker;\n        },\n        receiver: function() {\n          return worker;\n        }\n      };\n      postmaster = Postmaster({}, base);\n      return postmaster.invokeRemote(\"echo\", 17).then(function(result) {\n        return assert.equal(result, 17);\n      }).then(function() {\n        return done();\n      }, function(error) {\n        return done(error);\n      }).then(function() {\n        return worker.terminate();\n      });\n    });\n    return it(\"should fail quickly when contacting a window that doesn't support Postmaster\", function(done) {\n      var childWindow, iframe, postmaster;\n      iframe = document.createElement('iframe');\n      document.body.appendChild(iframe);\n      childWindow = iframe.contentWindow;\n      postmaster = Postmaster();\n      postmaster.remoteTarget = function() {\n        return childWindow;\n      };\n      return postmaster.invokeRemote(\"echo\", 5)[\"catch\"](function(e) {\n        if (e.message.match(/no ack/i)) {\n          return done();\n        } else {\n          return done(1);\n        }\n      }).then(function() {\n        return iframe.remove();\n      });\n    });\n  });\n\n}).call(this);\n",
          "type": "blob"
        }
      },
      "progenitor": {
        "url": "http://www.danielx.net/editor/"
      },
      "version": "0.4.0-pre.0",
      "entryPoint": "main",
      "repository": {
        "branch": "v0.4.0-pre.0",
        "default_branch": "master",
        "full_name": "distri/postmaster",
        "homepage": null,
        "description": "Send and receive postMessage commands.",
        "html_url": "https://github.com/distri/postmaster",
        "url": "https://api.github.com/repos/distri/postmaster",
        "publishBranch": "gh-pages"
      },
      "dependencies": {}
    }
  }
});