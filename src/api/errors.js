import { ERROR_BODY_MAX_LENGTH } from '../../config/apiConstants.js';

const ERROR_HEADING_PATTERN = /<h2>(.*?)<\/h2>/s;
const HTML_TAG_PATTERN = /<[^>]+>/g;

/**
 * Reduces an error response body to a short summary.
 * @param {string} body - Raw response body (HTML page or plain text).
 * @returns {string} Error heading text, or the body itself, cut to the maximum length.
 */
export function summarizeErrorBody(body) {
  const heading = ERROR_HEADING_PATTERN.exec(body);
  const summary = heading
    ? heading[1].replace(HTML_TAG_PATTERN, '').trim()
    : body;
  return summary.slice(0, ERROR_BODY_MAX_LENGTH);
}
