import { expect, mock, test } from "bun:test";
import { setTimeout } from "timers/promises";
import { batch } from "./index";

const createBulkRetriever = () =>
  mock(async (ids: Set<string>) => {
    // Add an artificial delay to uncover timing issues
    await setTimeout(25);
    return new Map<string, { id: string }>(
      Array.from(ids).map((id) => [id, { id }])
    );
  });

test("waits until the next tick of the event loop before flushing calls", async () => {
  const bulkRetriever = createBulkRetriever();
  const getId = batch(bulkRetriever);

  expect(bulkRetriever.mock.calls.length).toBe(0);
  getId("1");
  await setTimeout();
  expect(bulkRetriever.mock.calls.length).toBe(1);

  getId("1");
  getId("2");
  getId("3");
  await setTimeout();

  expect(bulkRetriever.mock.calls.length).toBe(2);
});

test("getId returns expected content", async () => {
  const bulkRetriever = createBulkRetriever();
  const getId = batch(bulkRetriever);

  const result = await getId("1");
  expect(result).toEqual({ id: "1" });
});

test("batch throws the error thrown by the bulk fn", async () => {
  const getId = batch(() => {
    throw new Error("failed_to_fetch");
  });

  await expect(getId("1")).rejects.toThrow("failed_to_fetch");
});
