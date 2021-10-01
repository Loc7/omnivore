/* START Initialization */
var entityNames = []
var regexpForTags = new RegExp("<svg[^>]*>(.*?)<\/svg>|<[^>]*>|{[^\"}]*}")
var regexpForJson = new RegExp("\".*\"\s*:")
var regexpForKeys = new RegExp("[^\"\r\n].*=")
var placeholderLeftForTags = "(!tg" //Results in: (!tg0), (!tg1) ...
var placeholderLeftForKeys = "(!ky"
var placeholderLeftForJsonKeys = "(!jn"
var placeholderRight = ")"
var wordCount = 0
var replacementCount = 0
var characterCount = 0
var regexpForOperation = new RegExp()
var placeholderLeft = ""
var placeholdersForOperation = []
/* END Initialization */

$(document).ready(function () {
  $("textarea").focus()

  $("textarea").bind("input propertychange", function () {
    var mode = $('input[name=mode]:checked', '#mode').val()

    if (mode != "bypass") {
      $(".match").remove()
      placeholdersForOperation = []

      if (mode === "non-text") {
        regexpForOperation = regexpForTags
        placeholderLeft = placeholderLeftForTags
        ReplaceLogic(this)      

        regexpForOperation = regexpForJson
        placeholderLeft = placeholderLeftForJsonKeys
        ReplaceLogic(this)
      }

      if (mode === "text-keys") {
        regexpForOperation = regexpForKeys
        placeholderLeft = placeholderLeftForKeys
        ReplaceLogic(this)
      }

      if ($("#remove-linebreaks").is(':checked')) {
        removeLinebreaks(this)
      }

      if ($("#remove-whitespace").is(':checked')) {
        removeWhitespace(this)
      }

      if ($("#autocopy").is(':checked')) {
        copyText()
      }
    } else {
      AppendWordCountNumber($(this).val())
    }
  });

  /* START Menu buttons */
  $("#copy-text").click(function () {
    copyText()
    notify("Text copied")
  })

  $("#reset").click(function () {
    initialize()
    notify("Omnivore has been reset.")
  })
  /* END Menu buttons */

  /* START Option buttons */
  $("#autocopy").click(function () {
    notify("Auto copy toggled")
  })

  $("#remove-linebreaks").click(function () {
    notify("Line break removal toggled")
  })

  $("#remove-whitespace").click(function () {
    notify("Whitespace removal toggled")
  })

  $("#tutorial").click(function () {
    $("#tutorial-container").toggle()
    notify("Tutorial toggled")
  })
  /* END Option buttons */
});

function copyText() {
  $("textarea")
    .focus()
    .select()
  document.execCommand("copy")
  notify("Elements replaced and text copied")
}

function removeLinebreaks(textarea) {
  var str = $(textarea).val()
  str = str.replace(/\s\n|(?<=[^\.:])\n/gm, " ")
  $(textarea).val(str)
}

function removeWhitespace(textarea) {
  var str = $(textarea).val()
  str = str.replace(/[  ]+/gm, " ")
  $(textarea).val(str)
}

function notify(notification) {
  $(".notification").text(notification).stop(true, true).fadeIn().delay(5000).fadeOut()
}

function initialize() {
  $("textarea")
    .focus()
    .select()
  document.execCommand("delete")
  entityNames = []
  wordCount = 0
  characterCount = 0
  replacementCount = 0
  regexpForOperation = new RegExp()
  placeholdersForOperation = []
  $("#replacements").text(replacementCount)
  $("#words").text(wordCount)
  $("#characters").text(characterCount)
  $("#replacement").hide()
}

function ReplaceLogic(textarea) {
  var str = $(textarea).val()
  var index = 0
  var replacementValues = [str, index]

  if (str.search(new RegExp("\\" + placeholderLeft, "i")) > -1 && entityNames.length > 0) {
    for (var entity of entityNames) {
      var original = placeholderLeft + index + placeholderRight
      var replacement = GetEscapedEntity(entity)

      str = str.replace(new RegExp("\\" + placeholderLeft + index + "\\" + placeholderRight, "gi"), entity)
      AppendReplacementValues(original, replacement)
      index++

      if (str.indexOf(placeholderLeft) == -1) {
        break
      }
    }

    for (i = 0; i < index; i++) {
      entityNames.shift()
    }

    AppendReplacementCountNumber(index)
  } else {
    var replacementValues = RecursiveEntityReplacement(str, index)
    str = replacementValues[0]
    AppendReplacementCountNumber(replacementValues[1])
    AppendWordCountNumber(str)
  }

  $(textarea).val(str)
}

function RecursiveEntityReplacement(str, index) {
  var hasMatch = false
  var replacementValues = [str, index]

  str = str.replace(regexpForOperation, function (match) {
    var original = GetEscapedEntity(match)
    var replacement = placeholderLeft + index + placeholderRight

    AppendReplacementValues(original, replacement)
    entityNames.push(match)
    hasMatch = true
    return match
  });

  if (hasMatch) {
    str = str.replace(regexpForOperation, placeholderLeft + index + placeholderRight)
    index++

    replacementValues = RecursiveEntityReplacement(str, index)
  }

  return replacementValues
}

function AppendReplacementValues(original, replacement) {
  $("#appendReplacements").append(
    "<tr class='match'><td>" +
    original +
    "</td><td>" +
    replacement +
    "</td></tr>"
  )
  $("#replacement").show()
}

function GetEscapedEntity(entity) {
  entity = entity.replace(/</g, "&lt;")
  entity = entity.replace(/>/g, "&gt;")
  return entity;
}

function AppendReplacementCountNumber(count) {
  replacementCount += count
  $("#replacements").text(replacementCount)
}

function AppendWordCountNumber(str) {
  str = str.replace(/\(!tg[0-9]*\)/gi, "")
  str = str.replace(/\(!jn[0-9]*\)/gi, "")
  str = str.replace(/\(!ky[0-9]*\)/gi, "")
  str = str.replace(/[\(\)\[\]\{\}\,]/gi, "")
  str = str.replace(/(^\s*)|(\s*$)/gi, "")
  str = str.replace(/[ ]{2,}/gi, " ")
  str = str.replace(/\n /, "\n")

  wordCount = str.trim().split(/\s+/).length
  characterCount = str.length

  $("#words").text(wordCount)
  $("#characters").text(characterCount)
}