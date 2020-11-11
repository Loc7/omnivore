var entityNames = []
var regexpForTags = new RegExp("<svg[^>]*>(.*?)<\/svg>|<[^>]*>") //SVG needs special treatment
var regexpForKeys = new RegExp(".*=")
var placeholderLeftForTags = "(!tg" //Right part concatenated like (tg0), (tg1) etc.
var placeholderLeftForKeys = "(!ky"
var placeholderRight = ")"
var wordCount = 0
var regexpForOperation = new RegExp()
var placeholderLeft = ""
var placeholdersForOperation = []


$(document).ready(function() {
  $("textarea").bind("input propertychange", function() {    
    var mode = $('input[name=mode]:checked', '#mode').val()

    $(".match").remove()
    placeholdersForOperation = []

    if (mode === "tag") {
      regexpForOperation = regexpForTags
      placeholderLeft = placeholderLeftForTags
      ReplaceLogic(this)
    }

    if (mode === "key") {
      //1: replace HTML
      regexpForOperation = regexpForTags
      placeholderLeft = placeholderLeftForTags
      ReplaceLogic(this)
      //2: replace Keys
      regexpForOperation = regexpForKeys
      placeholderLeft = placeholderLeftForKeys
      ReplaceLogic(this)
    }

    if (mode === 'word') {
      AppendWordCountNumber($(this).val())
    }
    
    if ($("#autocopy").is(':checked')) {
      copyText()
    }
  });

  // Buttons
  // Copy text
  $("#js-copy-text").click(function() {
    copyText()
    notify("Text copied")
  })

  // Clear text
  $("#js-clear-text").click(function() {
    $("textarea")
      .focus()
      .select()
    document.execCommand("delete")
    initialize()
    notify("Text cleared")
  })

  
  // Quick copy
  $(".js-copy").click(function() {
    $(this)
      .focus()
      .select()
    document.execCommand("copy")
    notify("Symbol copied")
  })
});

function copyText() {
  $("textarea")
      .focus()
      .select()
    document.execCommand("copy")
    notify("Elements replaced and text copied")
}

function notify(notification) {
  $(".notification").text(notification).stop(true, true).fadeIn().delay(5000).fadeOut()
}

function initialize() {
  entityNames = []
  wordCount = 0
  regexpForOperation = new RegExp()
  placeholdersForOperation = []
  $("#words").text(wordCount)
  $("#replacement").css("visibility", "collapse")
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

      // Remove only entities that have been replaced
      for (i = 0; i < index; i++) {
        entityNames.shift()
      }

      AppendReplacementNumber(index)
  } else {     
      var replacementValues = RecursiveEntityReplacement(str, index)
      str = replacementValues[0]
      AppendReplacementNumber(replacementValues[1])
      AppendWordCountNumber(str)
  }

  $(textarea).val(str)
}

function RecursiveEntityReplacement(str, index) {
  var hasMatch = false
  var replacementValues = [str, index]

  str = str.replace(regexpForOperation, function(match) {
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
  $("#replacement").css("visibility", "visible")
}

function GetEscapedEntity(entity) {
    entity = entity.replace(/</g, "&lt;")
    entity = entity.replace(/>/g, "&gt;")
    return entity;
}

function AppendReplacementNumber(number) {
    $("#replacements").text(number)
}

function AppendWordCountNumber(str) { 
    var replaceStr = "/\\" + placeholderLeft + "[0-9]*\\" + placeholderRight + "/gi"
  
    str = str.replace(replaceStr, "")
    str = str.replace(/(^\s*)|(\s*$)/gi,"")
    str = str.replace(/[ ]{2,}/gi," ")
    str = str.replace(/\n /,"\n")

    var wordCountNumber = str.trim().split(/\s+/).length

    $("#words").text(wordCountNumber)
}