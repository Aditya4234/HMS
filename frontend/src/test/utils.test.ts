import { formatCurrency, formatDate, getInitials, getStatusColor, truncate, formatNumber } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("formatCurrency", () => {
    it("formats USD correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats zero correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("formatDate", () => {
    it("formats a date string correctly", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("getInitials", () => {
    it("returns initials for full name", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("returns single initial for one name", () => {
      expect(getInitials("Alice")).toBe("A");
    });

    it("handles empty string", () => {
      expect(getInitials("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("truncates long strings", () => {
      expect(truncate("Hello World This Is Long", 10)).toBe("Hello Worl...");
    });

    it("does not truncate short strings", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
    });
  });

  describe("formatNumber", () => {
    it("formats thousands", () => {
      expect(formatNumber(1500)).toBe("1.5K");
    });

    it("formats millions", () => {
      expect(formatNumber(2500000)).toBe("2.5M");
    });

    it("returns number as string for small values", () => {
      expect(formatNumber(500)).toBe("500");
    });
  });

  describe("getStatusColor", () => {
    it("returns correct color for AVAILABLE", () => {
      expect(getStatusColor("AVAILABLE")).toContain("text-green-500");
    });

    it("returns correct color for OCCUPIED", () => {
      expect(getStatusColor("OCCUPIED")).toContain("text-blue-500");
    });

    it("returns correct color for CANCELLED", () => {
      expect(getStatusColor("CANCELLED")).toContain("text-red-500");
    });

    it("returns fallback for unknown status", () => {
      expect(getStatusColor("UNKNOWN")).toContain("text-gray-500");
    });
  });
});
