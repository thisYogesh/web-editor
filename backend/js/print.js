const { log, color, colorType } = require('colored-cli')
const { valueType } = require("../../js/enums");
const frame = {
  lt : '\u256D',
  rt : '\u256E',
  lb : '\u2570',
  rb : '\u256F',
  hl : '\u2500',
  vl : '\u2502',
}

function charMultiplier(len, char) {
  let val = "";
  for (let i = 0; i < len; i++) {
    val += char;
  }

  return val;
}

function getHL(len) {
  return charMultiplier(len, frame.hl);
}

function getSpace(len) {
  return charMultiplier(len, " ");
}

function buildContent(lines, maxLen) {
  return lines.reduce(function(newlines, lineItem) {
    const lineType = typeof lineItem === "string" ? 1 : 0;
    const value = lineType === valueType.Object ? lineItem.value : lineItem;
    const diff = lineType === valueType.Object ? lineItem.diff : 0;
    const space = getSpace(maxLen - value.length + diff);
    newlines.push(
      log
        .value(`${frame.vl}`)
        .color(colorType.fg, color.green)
        .value(value)
        .color(colorType.fg, color.white)
        .value(`${space}${frame.vl}\n`)
        .color(colorType.fg, color.green)
        .return()
    );
    return newlines;
  }, []);
}

function formatLine(value, options) {
  if (options) {
    value = log
      .value(value)
      .effect(options.effect)
      .color(options.type, options.color1, options.color2)
      .return();
  }
  return value;
}

function combineValues(values) {
  let val = "";
  if (Array.isArray(values)) {
    values.forEach(function(item) {
      val += item.value || item;
    });
  } else {
    val = values;
  }

  return val;
}

function buildupLines(line, maxLen, dataset) {
  const lineType = typeof line === "string" ? 1 : 0;
  const lineValue =
    lineType === valueType.Object
      ? combineValues(line.value || line.values)
      : line;
  const lines = lineValue.split("\n");

  lines.forEach((lineItem, i) => {
    const len = lineItem.length;
    if (len > maxLen) maxLen = len;

    if (lineType === valueType.Object) {
      let formattedValue = "";

      if (line.value) {
        formattedValue = formatLine(lineItem, line.options);
      } else {
        formattedValue = line.values.reduce(function(fvalues, lineWord) {
          fvalues += formatLine(lineWord.value || lineWord, lineWord.options);
          return fvalues;
        }, "");
      }

      lines[i] = {
        value: formattedValue,
        diff: formattedValue.length - len
      };
    }
  });

  dataset.push.apply(dataset, lines);

  return maxLen;
}

function getBoxData(lines) {
  const dataset = [];
  let maxLen = 0;
  if (Array.isArray(lines)) {
    lines.forEach(function(line) {
      maxLen = buildupLines(line, maxLen, dataset);
    });
  } else {
    maxLen = buildupLines(lines, maxLen, dataset);
  }

  return {
    lines: dataset,
    maxLen
  };
}

function printBox(text) {
  const data = getBoxData(text);
  const HL = getHL(data.maxLen);
  const header = log
    .value(`${frame.lt}${HL}${frame.rt}\n`)
    .color(colorType.fg, color.green)
    .return();

  const content = buildContent(data.lines, data.maxLen);

  const footer = log
    .value(`${frame.lb}${HL}${frame.rb}`)
    .color(colorType.fg, color.green)
    .return();

  return header + content.join("") + footer;
}

module.exports = printBox