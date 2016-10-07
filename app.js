
//libraries
var request = require("request");

function htmlElement(str) {
  this.rawHTML = str;

  //analysis
  var open = false;
  var currName = "";
  var opened = [];
  var closeTag = false;
  var readingChildNode = false;
  var currChildNode = "";
  var readingValue = false;
  var currValue = "";
  var newText = false;
  var text = "";

  this.childNodes = [];
  this.children = [];

  var splitted = this.rawHTML.split("");
  for(var i = 0; i < splitted.length; i++) {
    if(!open && !readingChildNode && splitted[i] !== "<" && splitted[i] !== ">") {
      text += splitted[i];
      newText = false;
    } else if(!newText) {
      if(text !== "") {
        this.children.push(text);
        text = "";
      }
      newText = true;
    }
    if(readingChildNode) {
      currChildNode += splitted[i];
    }
    if(readingValue) {
      currValue += splitted[i];
    }
    if(splitted[i] === ">") {
      open = false;
      if(closeTag) {
        for(var j = opened.length - 1; j >= 0; j--) {
          if(currName === opened[j]) {

            //READING
            if(opened.length === 2) {
              this.childNodes.push(new htmlElement("<" + currName + ">" + currChildNode));
              this.children.push(new htmlElement("<" + currName + ">" + currChildNode));
              currChildNode = "";
              readingChildNode = false;
            }

            opened.splice(j, 1);
            j = -1;
          } else {
            opened.splice(j, 1);
          }
        }
        //opened.push(currName);
        closeTag = false;
      } else {
        opened.push(currName);
        if(opened.length === 1) {
          this.type = opened[0];
          readingValue = true;
        } else if(opened.length === 2) {
          readingChildNode = true;
        }
      }
      currName = "";
    }
    if(open) {
      currName += splitted[i];
    }
    if(splitted[i] === "<") {
      if(splitted[i + 1] === "/") {
        closeTag = true;
        i++;
        if(readingChildNode) {
          currChildNode += splitted[i];
        }
        if(readingValue) {
          currValue += splitted[i];
        }
      }
      open = true;
    }
  }

  var currValueSplitted = currValue.split("");
  var valuePos = this.type.split("").length + 3
  var start = currValueSplitted.length - valuePos;
  for(var i = start; i < start + valuePos; i++) {
    currValueSplitted.splice(start);
  }
  this.value = currValueSplitted.join("");

}

htmlElement.prototype.getChildNodes = function(nodeName) {
  var ret = [];
  for(var i = 0; i < this.childNodes.length; i++) {
    if(this.childNodes[i].type === nodeName) {
      ret.push(this.childNodes[i]);
    }
  }
  return ret;
}

htmlElement.prototype.getChildNode = function(nodeName, ind) {
  var nodes = this.getChildNodes(nodeName);
  if(nodes.length === 0) {
    return false;
  }
  if(ind) {
    if(ind < 0) {
      return nodes[0];
    } else if(ind > nodes.length - 1) {
      return nodes[nodes.length - 1];
    } else {
      return nodes[ind];
    }
  } else {
    return nodes[0];
  }
}

function webPage() {
  var document;
  var window;

  this.data = {
    document: document,
    window: window
  };

  this.url = "";
  var resivedData;

  var files = {
    main: null
  };
  this.files = function() {
    return files;
  }

  this.newPage = function(url, callback, data, method) {
    this.url = url;

    request({
      uri: url,
      qs: data || {},
      method: method || "GET"

    }, function (err, res, body) {
      if (!err) {
        resivedData = res;
        //removeing <!DOCTYPE html>
        var splitted = res.body.split("");
        var testDoctype = "";
        var doctype = "<!doctype html>";
        var doctypeArray = doctype.split("");
        var match = true;
        for(var i = 0; i < doctypeArray.length; i++) {
          if(doctypeArray[i] !== splitted[i].toLowerCase()) {
            match = false;
          }
        }
        var htmlString = "";
        if(match) {
          for(var i = doctypeArray.length; i < splitted.length; i++) {
            htmlString += splitted[i];
          }
        } else {
          htmlString = res.body;
        }
        files.main = new htmlElement(htmlString);
        if(callback) {
          callback();
        }
      } else {
        console.error(err);
        throw err;
      }
    });
  }


}

module.exports = {
  htmlElement: htmlElement,
  webPage: webPage
};

//debugging

var test = new webPage();
test.newPage("http://localhost:3000/", function() {
  console.log(test.files().main.childNodes[0].getChildNode("title").value);
});
