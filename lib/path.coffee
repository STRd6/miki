module.exports =
  normalizePath: (path, base=[]) ->
    base = base.concat path
    result = []

    while base.length
      switch piece = base.shift()
        when ".."
          result.pop()
        when "", "."
          # Skip
        else
          result.push(piece)

    return result
