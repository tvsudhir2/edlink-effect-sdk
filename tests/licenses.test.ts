import { describe, expect, it } from "vitest";
import { listLicenses } from "@/api/v2/licenses.js";
import { EdlinkApiError, EdlinkDecodeError } from "@/errors.js";
import { licenseFixture, licenseFixture2, licenseFixture3 } from "@tests/helpers/fixtures.js";
import { type MockHandler, makeTestHttpClient } from "@tests/helpers/mock-http-client.js";
import { makeCtx } from "@tests/helpers/test-config.js";
import { BASE, collect, collectFail, fail, page } from "@tests/helpers/test-utils.js";

// ============================================================================
// listLicenses (paginated stream — list only, no fetch)
// ============================================================================

describe("listLicenses", () => {
  it("streams items across pages; returns empty for no data", async () => {
    const empty = await collect(listLicenses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([])))));
    expect(empty).toHaveLength(0);

    const items = await collect(
      listLicenses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([licenseFixture, licenseFixture2])))),
    );
    expect(items).toHaveLength(2);
    expect(items[0]!.product_id).toBe("prod-001");
    expect(items[0]!.class_count).toBe(10);

    let calls = 0;
    const multi: MockHandler = () => {
      calls++;
      return calls === 1 ? page([licenseFixture], `${BASE}/next?cursor=p2`) : page([licenseFixture2]);
    };
    const multiItems = await collect(listLicenses({ type: "all" }, makeCtx(makeTestHttpClient(multi))));
    expect(multiItems).toHaveLength(2);
    expect(calls).toBe(2);
  });

  it("respects maxPages and maxRecords pagination limits", async () => {
    let pc = 0;
    const byPages = await collect(
      listLicenses(
        { type: "pages", maxPages: 2 },
        makeCtx(
          makeTestHttpClient(() => {
            pc++;
            return page([{ ...licenseFixture, product_id: `p-${pc}` }], `${BASE}/next?p=${pc + 1}`);
          }),
        ),
      ),
    );
    expect(pc).toBe(2);
    expect(byPages).toHaveLength(2);

    let rc = 0;
    const byRecs = await collect(
      listLicenses(
        { type: "records", maxRecords: 5 },
        makeCtx(
          makeTestHttpClient(() => {
            rc++;
            return page(
              [
                { ...licenseFixture, product_id: `r-${rc}a` },
                { ...licenseFixture2, product_id: `r-${rc}b` },
                { ...licenseFixture3, product_id: `r-${rc}c` },
              ],
              `${BASE}/next?p=${rc + 1}`,
            );
          }),
        ),
      ),
    );
    expect(rc).toBe(2);
    expect(byRecs).toHaveLength(5);
  });

  it("returns EdlinkApiError on 500, EdlinkDecodeError on bad data", async () => {
    const err500 = await collectFail(listLicenses({ type: "all" }, makeCtx(makeTestHttpClient(() => fail(500)))));
    expect(err500).toBeInstanceOf(EdlinkApiError);

    const errDecode = await collectFail(
      listLicenses({ type: "all" }, makeCtx(makeTestHttpClient(() => page([{ bad: true }])))),
    );
    expect(errDecode).toBeInstanceOf(EdlinkDecodeError);
  });
});
