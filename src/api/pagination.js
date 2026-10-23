import { PAGINATION } from '../../config/apiConstants.js';

/**
 * Fetches pages one by one and collects all items into a single array.
 * @param {(page: number) => Promise<object>} fetchPageFn - Returns a parsed page with data, total and total_pages.
 * @param {number} [maxPages] - Safety limit against endless loops.
 * @returns {Promise<{items: object[], total: number, pagesFetched: number}>} Collected items and API metadata.
 * @throws {Error} If the API reports more pages than maxPages.
 */
export async function fetchAllPages(
  fetchPageFn,
  maxPages = PAGINATION.MAX_PAGES,
) {
  if (typeof fetchPageFn !== 'function') {
    throw new TypeError('fetchPageFn must be a function');
  }

  const items = [];
  let total = 0;
  let totalPages = PAGINATION.FIRST_PAGE;
  let pagesFetched = 0;

  for (let page = PAGINATION.FIRST_PAGE; page <= totalPages; page += 1) {
    if (page > maxPages) {
      throw new Error(
        `Page limit ${maxPages} exceeded: API reports ${totalPages} pages`,
      );
    }

    const body = await fetchPageFn(page);
    items.push(...body.data);
    total = body.total;
    totalPages = body.total_pages;
    pagesFetched += 1;
  }

  return { items, total, pagesFetched };
}
