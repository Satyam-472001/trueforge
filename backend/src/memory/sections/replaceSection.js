import {
  SECTION_MARKERS
} from "./section.markers.js";

export const replaceSection = (
  markdown,
  section,
  newContent
) => {

  const markers =
    SECTION_MARKERS[section];

  if (!markers) {
    return markdown;
  }

  const [
    start,
    end
  ] = markers;

  const regex =
    new RegExp(
      `${start}[\\s\\S]*?${end}`
    );

  return markdown.replace(
    regex,
    `${start}

${newContent}

${end}`
  );
};