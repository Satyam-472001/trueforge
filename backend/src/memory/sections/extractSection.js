import {
  SECTION_MARKERS
} from "./section.markers.js";

export const extractSection = (
  markdown,
  section
) => {

  const markers =
    SECTION_MARKERS[section];

  if (!markers) {
    return "";
  }

  const [
    start,
    end
  ] = markers;

  const regex =
    new RegExp(
      `${start}([\\s\\S]*?)${end}`
    );

  const match =
    markdown.match(regex);

  if (!match) {
    return "";
  }

  return match[1].trim();
};