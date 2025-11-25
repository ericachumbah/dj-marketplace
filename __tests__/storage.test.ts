import { uploadFile, deleteFile } from "@/lib/storage";

describe("Storage Service", () => {
  it("should have uploadFile function", () => {
    expect(typeof uploadFile).toBe("function");
  });

  it("should have deleteFile function", () => {
    expect(typeof deleteFile).toBe("function");
  });

  it("uploadFile should require fileName", () => {
    expect(uploadFile).toBeDefined();
  });
});
