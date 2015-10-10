global.markdown = marked

# TODO: We'll want to load the file, then load a relative .css and .js
# We'll want to attach a handler to document to intercept link clicks and
# render relative files and update the current path.

render = (markdownText) ->
  html = marked markdownText

  document.body.innerHTML = html

readAsText = (blob) ->
  new Promise (resolve, reject) ->
    reader = new FileReader()

    reader.onloadend = ->
      resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(blob)

self =
  loadFile: (file) ->
    readAsText(file)
    .then (text) ->
      render(text)

  # We need to implement saveState and restoreState if we want to be able to
  # persist across popping the window in and out.
  saveState: ->
    

  restoreState: (state) ->
    # TODO: Need to set currentPath
    # need load base css and js

  focus: ->
    self.invokeRemote "focus"

# -------------------------------------------------
# From here on down is our Whimsy.space integration
Postmaster = require("postmaster")
Postmaster({}, self)

# Apps must call childLoaded if they want to receive state/file data from OS
self.invokeRemote "childLoaded"

# whimsy-file may return the link to the file data as a URL so we need to be
# able to download the contents
Ajax = require "./lib/ajax"

window.addEventListener "mousedown", ->
  self.focus()

processDropAsText = (e) ->
  jsonText = e.dataTransfer.getData("application/whimsy-file+json")
  if jsonText
    fileData = JSON.parse(jsonText)

    {content, url, path, type} = fileData

    if content
      Promise.resolve content
    else if url
      Ajax.getText(url)
  else
    file = e.dataTransfer.files[0]
    readAsText(file)

# Handle File Drops
dropReader = require "./lib/drop"
dropReader document, (e) ->
  processDropAsText(e)
  .then render
