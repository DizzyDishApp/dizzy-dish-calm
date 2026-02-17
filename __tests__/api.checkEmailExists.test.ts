import { checkEmailExists } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const mockRpc = supabase.rpc as jest.Mock;

describe("checkEmailExists", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("returns true when rpc returns true", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    const result = await checkEmailExists("Test@Example.com");
    expect(result).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("check_email_exists", {
      email_input: "test@example.com",
    });
  });

  it("returns false when rpc returns false", async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });

    const result = await checkEmailExists("new@example.com");
    expect(result).toBe(false);
  });

  it("returns false on error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });

    const result = await checkEmailExists("bad@example.com");
    expect(result).toBe(false);
  });

  it("trims whitespace from email", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    await checkEmailExists("  spaced@example.com  ");
    expect(mockRpc).toHaveBeenCalledWith("check_email_exists", {
      email_input: "spaced@example.com",
    });
  });
});
