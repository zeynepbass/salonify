import { describe, expect, it, vi } from "vitest";
import { combineQueries } from "@/lib/combineQueries";

const query = (overrides = {}) => ({
  data: undefined,
  isPending: false,
  isError: false,
  error: null,
  isFetching: false,
  refetch: vi.fn(),
  ...overrides,
});

describe("combineQueries", () => {
  it("biri bekliyorsa bekliyor sayılır", () => {
    expect(combineQueries(query({ data: 1 }), query({ isPending: true })).isPending).toBe(true);
  });

  it("ilk hatayı döner ve yalnızca başarısız/bekleyen sorguları yeniler", async () => {
    const ok = query({ data: 1 });
    const failed = query({ isError: true, error: new Error("x") });
    const combined = combineQueries(ok, failed);
    expect(combined.isError).toBe(true);
    expect(combined.error.message).toBe("x");
    await combined.refetch();
    expect(ok.refetch).not.toHaveBeenCalled();
    expect(failed.refetch).toHaveBeenCalledOnce();
  });

  it("verileri sırayla döner", () => {
    expect(combineQueries(query({ data: "a" }), query({ data: "b" })).data).toEqual(["a", "b"]);
  });

  it("sorgu verilmezse boş ve hatasız döner", () => {
    const combined = combineQueries();
    expect(combined).toMatchObject({ data: [], isPending: false, isError: false, error: null });
  });
});
